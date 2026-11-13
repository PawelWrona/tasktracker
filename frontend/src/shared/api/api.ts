export type FieldErrors = Record<string, string>

export class ApiError extends Error {
    public readonly status: number
    public readonly fieldErrors?: FieldErrors

    constructor(status: number, message: string, fieldErrors?: FieldErrors){
        super(message)
        this.name = "ApiError"
        this.status = status
        this.fieldErrors = fieldErrors
    }
}

type ErrorResponse = {
    message: string,
    errors?: FieldErrors
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
    if(typeof value !== "object" || value === null) return false

    if(!("message" in value) || typeof value.message !== "string") return false

    if (("errors" in value) && value.errors !== undefined){
        if(
            typeof value.errors !== "object" || 
            value.errors === null ||
            Array.isArray(value.errors)
        ){
            return false
        }

        for(const val of Object.values(value.errors)){
            if(typeof val !== "string"){
                return false
            }
        }
    }

    return true
}