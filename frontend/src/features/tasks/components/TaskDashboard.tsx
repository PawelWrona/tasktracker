import type { Task } from "../api/tasks"
import TaskCard from "./TaskCard"
import { ClipboardList } from "lucide-react"

type TaskDashboardProps = {
    tasks: Task[]
    fetchingError: string
}

export default function TaskDashboard({
    tasks,
    fetchingError
}: TaskDashboardProps) {
    const columns = [
        { title: "TO DO", status: "todo" },
        { title: "IN PROGRESS", status: "in_progress" },
        { title: "DONE", status: "done" }
    ] as const

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col pb-3">
            {fetchingError && (
                <p className="mb-4 text-danger">
                    {fetchingError}
                </p>
            )}

            <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="grid h-full min-h-0 min-w-[900px] grid-cols-3 gap-5">
                    {columns.map(column => {
                        const filteredTasks = tasks.filter(
                            t => t.status === column.status
                        )

                        return (
                            <div
                                key={column.status}
                                className="flex min-h-0 min-w-0 flex-col rounded-xl bg-surface-muted p-4"
                            >
                                <h2 className="mb-4 shrink-0 text-base font-bold text-text-muted">
                                    {column.title}
                                </h2>

                                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
                                    {filteredTasks.length > 0
                                        ? filteredTasks.map(t => (
                                            <TaskCard
                                                key={t.id}
                                                taskData={t}
                                            />
                                        ))
                                        : (
                                            <div className="flex flex-col items-center justify-center rounded-xl px-4 py-8 text-center">
                                                <div className="mb-1 flex h-12 w-12 items-center justify-center">
                                                    <ClipboardList
                                                        size={24}
                                                        strokeWidth={1.5}
                                                        className="text-text-subtle"
                                                    />
                                                </div>

                                                <p className="text-sm font-medium text-text-secondary">
                                                    No tasks yet
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}