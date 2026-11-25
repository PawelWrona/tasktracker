import { ApiError, isErrorResponse } from "../../../shared/api/api"
import { tokenStore } from "../../../shared/api/tokenStore"

type LoginRequest = {
    email: string,
    password: string
}

type LoginResponse = {
    access_token: string,
}

function doesResponseContainToken(value: unknown): value is LoginResponse{
    if(typeof value !== "object" || value === null){
        return false
    }

    const obj = value as Record<string, unknown>

    return typeof obj.access_token === "string"
}

export async function login(request: LoginRequest): Promise<void> {
    const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(request)
    })

    if (!response.ok) {
        let errData: unknown

        try{
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occurred"
            )
        }

        if(!isErrorResponse(errData)){
            throw new ApiError(
                response.status,
                "Unexpected error occurred"
            )
        }

        console.log(errData.message)

        throw new ApiError(
            response.status,
            errData.message,
            errData.errors
        )
    }

    let responseData: unknown

    try{
        responseData = await response.json()
    } catch {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    if(!doesResponseContainToken(responseData)){
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    tokenStore.set(responseData.access_token)
}

type RegisterRequest = {
    email: string,
    password: string
}

export async function register(request: RegisterRequest): Promise<void> {
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(request)
    })

    if(!response.ok){
        let errData: unknown

        try{
            errData = response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        if(!isErrorResponse(errData)){
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        throw new ApiError(
            response.status,
            errData.message,
            errData.errors
        )
    }

    if(response.status !== 201) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }
}

export async function logout(): Promise<void> {
    try {
        const response = await fetch("/api/auth/signout", {
            method: "POST",
            credentials: "include"
        })

        if (!response.ok) {
            throw new ApiError(
                response.status,
                "Failed to sign out"
            )
        }
    } finally {
        tokenStore.clear()
    }
}

export async function refreshAccessToken(): Promise<void> {
    const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
    })

    if (!response.ok) {
        if (response.status === 401) {
            tokenStore.clear()
        }

        let errData: unknown

        try {
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occurred"
            )
        }

        if (!isErrorResponse(errData)) {
            throw new ApiError(
                response.status,
                "Unexpected error occurred"
            )
        }

        throw new ApiError(
            response.status,
            errData.message
        )
    }

    let responseData: unknown

    try {
        responseData = await response.json()
    } catch {
        tokenStore.clear()

        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    if(!doesResponseContainToken(responseData)){
        tokenStore.clear()

        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    tokenStore.set(responseData.access_token)
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    async function makeRequest(): Promise<Response> {
        options.signal?.throwIfAborted()

        const token = tokenStore.get()
        const headers = new Headers(options.headers)

        if (token) {
            headers.set("Authorization", `Bearer ${token}`)
        }

        return fetch(url, { 
            ...options, 
            headers, 
            credentials: "include" 
        })
    }

    let response = await makeRequest()

    if (response.status === 401) {
        options.signal?.throwIfAborted()
        await refreshAccessToken()

        options.signal?.throwIfAborted()
        response = await makeRequest()
    }

    return response
}