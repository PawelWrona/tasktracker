
import { useState } from "react"
import type { Task } from "../api/tasks"
import { ChevronDown, ChevronUp } from "lucide-react"
import TaskEditModal from "./TaskEditModal"

type TaskDashboardProps = {
    tasks: Task[]
    fetchingError: string
}

export default function MyTaskDashboard({
    tasks,
    fetchingError
}: TaskDashboardProps) {
    const columns = [
        { title: "TO DO", status: "todo" },
        { title: "IN PROGRESS", status: "in_progress" },
        { title: "DONE", status: "done" }
    ] as const

    const [openTabels, setOpenTables] = useState({
        todo: true,
        in_progress: true,
        done: true,
    })

    const [editingTask, setEditingTask] = useState<Task | null>(null)

    return (
        <>
            <div className="flex min-w-0 flex-col gap-6">
                {fetchingError && (
                    <p className="text-danger">
                        {fetchingError}
                    </p>
                )}

                {columns.map(column => {
                    const filteredTasks = tasks.filter(
                        task => task.status === column.status
                    )

                    return (
                        <div
                            key={column.status}
                            className="overflow-hidden rounded-xl bg-surface-muted"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="px-5 py-4 text-base font-bold text-text-secondary">
                                    {column.title}
                                    <span className="ml-2 text-sm font-normal text-text-subtle">
                                        ({filteredTasks.length})
                                    </span>
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setOpenTables(prev => ({
                                        ...prev,
                                        [column.status]: !prev[column.status]
                                    }))}
                                    aria-label={
                                        openTabels[column.status]
                                            ? "Collapse section"
                                            : "Expand section"
                                    }
                                    aria-expanded={openTabels[column.status]}
                                    className="
                                        mr-5 flex h-9 w-9 shrink-0
                                        cursor-pointer items-center justify-center
                                        rounded-lg text-text-muted
                                        transition-colors
                                        hover:bg-surface-hover
                                        hover:text-foreground
                                    "
                                >
                                    {openTabels[column.status]
                                        ? <ChevronUp size={20} />
                                        : <ChevronDown size={20} />
                                    }
                                </button>
                            </div>

                            {openTabels[column.status] && (
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[650px] table-fixed text-left text-sm">
                                        <colgroup>
                                            <col className="w-[25%]" />
                                            <col className="w-[45%]" />
                                            <col className="w-[15%]" />
                                            <col className="w-[15%]" />
                                        </colgroup>

                                        <thead className="
                                            border-y border-border
                                            bg-surface
                                            text-xs uppercase text-text-muted
                                        ">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold">
                                                    Title
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Description
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Priority
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Due Date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border">
                                            {filteredTasks.map(task => (
                                                <tr
                                                    key={task.id}
                                                    className="
                                                        cursor-pointer
                                                        transition-colors
                                                        hover:bg-surface-hover/50
                                                    "
                                                    onClick={() => setEditingTask(task)}
                                                >
                                                    <td className="px-5 py-4 font-medium text-foreground">
                                                        <div className="truncate">
                                                            {task.title}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-text-secondary">
                                                        <div className="truncate">
                                                            {task.description || "—"}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-text-secondary">
                                                        {task.priority}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-text-secondary">
                                                        {task.due_date
                                                            ? new Date(task.due_date).toLocaleDateString("pl-PL")
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredTasks.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-5 py-6 text-center text-text-subtle"
                                                    >
                                                        No tasks
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {editingTask && (
                <TaskEditModal
                    taskData={editingTask}
                    onClose={() => setEditingTask(null)}
                    tasksQueryKey="my-tasks"
                />
            )}
        </>
    )
}
