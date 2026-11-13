export type TaskFilters = {
    assignedToUserId: number | null,
    priority: "low" | "medium" | "high" | "all",
    dueDateFrom: string,
    dueDateTo: string,
    sortBy: "priority" | "due_date" | null,
    sortOrder: "asc" | "desc"
}

export const defaultTaskFilters: TaskFilters = {
    assignedToUserId: null,
    priority: "all",
    dueDateFrom: "",
    dueDateTo: "",
    sortBy: null,
    sortOrder: "asc"
}