import type { ValidationValue } from "react-hook-form"
import { ApiError, isErrorResponse } from "../../../shared/api/api"
import { authenticatedFetch } from "../../auth/api/auth"


export type User = {
    id: number,
    name: string,
    email: string
}

type GetUsersResponse = { users: User[] }

function isUser(value: unknown): value is User {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "email" in value &&
        typeof value.id === "number" &&
        typeof value.name === "string" &&
        typeof value.email === "string"
    )
}

function isGetUsersResponse(value: unknown): value is GetUsersResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "users" in value &&
        Array.isArray(value.users) &&
        value.users.every(isUser)
    )
}

export async function getUsers(): Promise<User[]> {
    const response = await authenticatedFetch("/api/users", { method: "GET" })

    if (!response.ok) {
        let errData: unknown

        try {
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        if (!isErrorResponse(errData)) {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
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
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    if (!isGetUsersResponse(responseData)) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    return responseData.users
}

type GetCurrentUserResponse = {
    id: number,
    name: string,
    email: string,
    avatar_url: string | null, 
}

function isGetCurrentUserResponse(value: unknown): value is GetCurrentUserResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "email" in value &&
        "avatar_url" in value &&
        typeof value.id === "number" &&
        typeof value.name === "string" &&
        typeof value.email === "string" &&
        (
            value.avatar_url === null ||
            typeof value.avatar_url === "string"
        )
    )
}

export async function getCurrentUser(signal?: AbortSignal): Promise<GetCurrentUserResponse> {
    const response = await authenticatedFetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        signal
    })

    if (!response.ok) {
        let errData: unknown

        try {
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        if (!isErrorResponse(errData)) {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
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
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    if (!isGetCurrentUserResponse(responseData)) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    return responseData
}

type changePasswordRequest = {
    current_password: string,
    new_password: string
}

export async function changePassword(request: changePasswordRequest): Promise<void> {
    const response = await authenticatedFetch("/api/users/me/change-password", { 
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
    })

    if (!response.ok) {
        let errData: unknown

        try {
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        if (!isErrorResponse(errData)) {
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

    if (response.status !== 204) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }
}

export async function changeAvatar(file: File): Promise<void> {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await authenticatedFetch("/api/users/me/change-avatar", {
        method: "PATCH",
        credentials: "include",
        body: formData
    })

    if (!response.ok) {
        let errData: unknown

        try {
            errData = await response.json()
        } catch {
            throw new ApiError(
                response.status,
                "Unexpected error occured"
            )
        }

        if (!isErrorResponse(errData)) {
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

    if (response.status !== 204) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }
}