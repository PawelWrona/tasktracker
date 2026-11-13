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
            color: "text-red-600",
            label: "High"
        },
        medium: {
            icon: Minus,
            color: "text-blue-600",
            label: "Medium"
        },
        low: {
            icon: ChevronDown,
            color: "text-slate-500",
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

    const dueDate = taskData.due_date ? new Date(taskData.due_date) : null

    const isOverdue = (
        dueDate !== null &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < today &&
        taskData.status !== "done"
    )

    const [ isTaskEditModalOpen, setIsTaskEditModalOpen ] = useState(false)

    return (
        <>
            <div 
                className={`
                    min-w-0 rounded-lg bg-white p-4
                    cursor-pointer transition-shadow
                    ${isOverdue
                        ? "shadow-[0_0_12px_2px_rgba(239,68,68,0.18)]"
                        : "shadow-sm"
                    }
                `}
                onClick={() => setIsTaskEditModalOpen(true)}
            >
                <h3 className="break-words font-semibold">
                    {taskData.title}
                </h3>

                <p className="mt-2 line-clamp-3 break-words text-sm text-gray-500">
                    {taskData.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div className={`flex items-center gap-1 ${priorityColor}`}>
                        <PriorityIcon size={18} />
                        <span className="text-xs font-medium">{priorityLabel}</span>
                    </div>
                </div>
            </div>
            { isTaskEditModalOpen && 
                <TaskEditModal 
                    taskData={taskData}
                    onClose={() => setIsTaskEditModalOpen(false)}
                    tasksQueryKey={"tasks"}
                /> 
            }
        </>
    )
}