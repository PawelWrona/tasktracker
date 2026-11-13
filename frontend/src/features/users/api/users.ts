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