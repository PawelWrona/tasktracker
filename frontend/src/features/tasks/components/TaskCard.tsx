
import type { Task } from "../api/tasks"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
import TaskEditModal from "./TaskEditModal"
import { useState } from "react"

type TaskCardProps = {
    taskData: Task
}

export default function TaskCard({ taskData }: TaskCardProps) {
    const taskPriority = {
        high: {
            icon: ChevronUp,
            color: "text-danger",
            label: "High"
        },
        medium: {
            icon: Minus,
            color: "text-primary",
            label: "Medium"
        },
        low: {
            icon: ChevronDown,
            color: "text-text-muted",
            label: "Low"
        }
    }

    const {
        icon: PriorityIcon,
        color: priorityColor,
        label: priorityLabel
    } = taskPriority[taskData.priority]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = taskData.due_date
        ? new Date(taskData.due_date)
        : null

    const isOverdue = (
        dueDate !== null &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < today &&
        taskData.status !== "done"
    )

    const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState(false)

    return (
        <>
            <div
                className={`
                    min-w-0 rounded-lg border
                    bg-surface p-4
                    cursor-pointer transition-shadow
                    ${isOverdue
                        ? "border-danger/40 shadow-[0_0_12px_2px_var(--app-danger-glow)]"
                        : "border-border-subtle shadow-sm"
                    }
                `}
                onClick={() => setIsTaskEditModalOpen(true)}
            >
                <h3 className="break-words font-semibold text-foreground">
                    {taskData.title}
                </h3>

                <p className="
                    mt-2 line-clamp-3 break-words
                    text-sm text-text-muted
                ">
                    {taskData.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div className={`flex items-center gap-1 ${priorityColor}`}>
                        <PriorityIcon size={18} />
                        <span className="text-xs font-medium">
                            {priorityLabel}
                        </span>
                    </div>
                </div>
            </div>

            {isTaskEditModalOpen && (
                <TaskEditModal
                    taskData={taskData}
                    onClose={() => setIsTaskEditModalOpen(false)}
                    tasksQueryKey="tasks"
                />
            )}
        </>
    )
}
