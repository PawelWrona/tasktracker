
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

    const [editingTask, setEditingTask ] = useState<Task | null>(null)

    return (
        <>
            <div className="flex min-w-0 flex-col gap-6">
                {fetchingError && (
                    <p className="text-red-500">
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
                            className="overflow-hidden rounded-xl bg-gray-100"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="px-5 py-4 text-base font-bold text-gray-600">
                                    {column.title}
                                    <span className="ml-2 text-sm font-normal text-gray-400">
                                        ({filteredTasks.length})
                                    </span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setOpenTables(prev => ({ ...prev, [column.status]: !prev[column.status] }))}
                                    aria-label={openTabels[column.status] ? "Expand sidebar" : "Collapse sidebar"}
                                    aria-expanded={!openTabels[column.status]}
                                    className="mr-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 cursor-pointer"
                                >
                                    { openTabels[column.status]
                                        ? <ChevronUp size={20} />
                                        : <ChevronDown size={20} />
                                    }
                                </button>
                            </div>

                            { openTabels[column.status] && (
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[650px] table-fixed text-left text-sm">
                                        <colgroup>
                                            <col className="w-[25%]" />
                                            <col className="w-[45%]" />
                                            <col className="w-[15%]" />
                                            <col className="w-[15%]" />
                                        </colgroup>
                                        <thead className="border-y border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
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

                                        <tbody className="divide-y divide-gray-200">
                                            {filteredTasks.map(task => (
                                                <tr
                                                    key={task.id}
                                                    className="transition-colors hover:bg-gray-200/50 cursor-pointer"
                                                    onClick={() => setEditingTask(task)}
                                                >
                                                    <td className="px-5 py-4 font-medium text-gray-800">
                                                        <div className="truncate">
                                                            {task.title}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        <div className="truncate">
                                                            {task.description || "—"}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        {task.priority}
                                                    </td>

                                                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
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
                                                        className="px-5 py-6 text-center text-gray-400"
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
                    tasksQueryKey={"my-tasks"}
                />
            )}
         </>
    )
}
