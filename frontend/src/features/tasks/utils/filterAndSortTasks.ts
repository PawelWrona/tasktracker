import type { Task } from "../api/tasks";
import type { TaskFilters } from "../types/taskFilters";

type FilterOptions = {
    enableFilterByAssignedUser?: boolean
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters, options: FilterOptions = {}) {
    const { enableFilterByAssignedUser = true } = options

    const result = tasks.filter(task => {
        if (
            enableFilterByAssignedUser &&
            filters.assignedToUserId !== null &&
            task.assigned_to_user_id !== filters.assignedToUserId
        ) return false

        if (
            filters.priority !== "all" &&
            task.priority !== filters.priority
        ) return false

        if (filters.dueDateFrom) {
            if (
                !task.due_date ||
                task.due_date.slice(0, 10) < filters.dueDateFrom
            ) return false
        }

        if (filters.dueDateTo) {
            if (
                !task.due_date ||
                task.due_date.slice(0, 10) > filters.dueDateTo
            ) return false
        }

        return true
    })

    if (filters.sortBy === "priority") {
        const priorityOrder = {
            low: 1,
            medium: 2,
            high: 3
        }

        result.sort((a, b) => {
            const diff = priorityOrder[a.priority] - priorityOrder[b.priority]

            return filters.sortOrder === "asc" ? diff : -diff
        })
    }

    if (filters.sortBy === "due_date") {
        result.sort((a, b) => {
            if (a.due_date === null && b.due_date === null) return 0

            if (a.due_date === null) {
                return filters.sortOrder === "asc" ? -1 : 1
            }

            if (b.due_date === null) {
                return filters.sortOrder === "asc" ? 1 : -1
            }

            const diff =  new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            return filters.sortOrder === "asc" ? diff : -diff
        })
    }
    
    return result
}