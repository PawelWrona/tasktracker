import { ApiError, isErrorResponse } from "../../../shared/api/api"
import { authenticatedFetch } from "../../auth/api/auth"


export const allowedTaskStatuses = ["todo", "in_progress", "done"]
export const allowedTaskPriorities = ["low", "medium", "high"]

export type Task = {
    id: number,
    created_by_user_id: number,
    assigned_to_user_id: number | null,
    title: string,
    description: string,
    status: "todo" | "in_progress" | "done",
    priority: "low" | "medium" | "high",
    due_date: string | null,
    created_at: string,
    updated_at: string
}

type GetTasksResponse = {
    tasks: Task[] 
}

function isTask(value: unknown): value is Task {
    if (typeof value !== "object" || value === null) return false

    const obj = value as Record<string, unknown>

    return (
        typeof obj.id === "number" &&
        typeof obj.created_by_user_id === "number" &&
        (obj.assigned_to_user_id === null || typeof obj.assigned_to_user_id === "number") &&
        typeof obj.title === "string" &&
        typeof obj.description === "string" &&
        (obj.status === "todo" || obj.status === "in_progress" || obj.status === "done") &&
        (obj.priority === "low" || obj.priority === "medium" || obj.priority === "high") &&
        (obj.due_date === null || typeof obj.due_date === "string") &&
        typeof obj.created_at === "string" &&
        typeof obj.updated_at === "string"
    )
}

function isGetTasksResponse(value: unknown): value is GetTasksResponse {
    if (typeof value !== "object" || value === null) return false

    if(!("tasks" in value)) return false

    if (!Array.isArray(value.tasks)) return false

    return value.tasks.every(isTask)
}

export async function getTasks(signal?: AbortSignal): Promise<Task[]> {
    const response = await authenticatedFetch("/api/tasks", { method: "GET", signal })

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

    if (!isGetTasksResponse(responseData)) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    return responseData.tasks
}

export async function getMyTasks(signal?: AbortSignal): Promise<Task[]> {
    const response = await authenticatedFetch("/api/tasks/assigned-to-me", { method: "GET", signal })

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

        if(!isErrorResponse(errData)) {
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

    if (!isGetTasksResponse(responseData)) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }

    return responseData.tasks
}

type CreateTaskRequest = {
    assigned_to_user_id?: number | null;
    title: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    due_date?: string | null;
}

export async function createTask(request: CreateTaskRequest): Promise<void> {
    const response = await authenticatedFetch("/api/tasks", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

    if (response.status !== 201) {
        throw new ApiError(
            response.status,
            "Unexpected response from the server"
        )
    }
}

type UpdateTaskRequest = {
    assigned_to_user_id?: number | null;
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    due_date?: string | null;
}

type UpdateTaskParams = {
    request: UpdateTaskRequest,
    taskId: number
}

export async function updateTask({request, taskId}: UpdateTaskParams): Promise<void>{
    const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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