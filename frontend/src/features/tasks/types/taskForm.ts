import type { Task } from "../api/tasks"

export type TaskFormValues = {
    title: string,
    description: string,
    assignedToUserId: number | null, 
    dueDate: string,
    status: Task["status"],
    priority: Task["priority"],
}

export const defaultTaskFormValues: TaskFormValues = {
    title: "",
    description: "",
    assignedToUserId: null,
    dueDate: "",
    status: "todo",
    priority: "medium"
}