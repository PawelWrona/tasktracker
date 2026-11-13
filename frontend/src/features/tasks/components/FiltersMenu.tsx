import { useEffect, type Dispatch, type SetStateAction } from "react"
import { defaultTaskFilters, type TaskFilters } from "../types/taskFilters"
import { X } from "lucide-react"
import { useUsers } from "../../users/hooks/useUsers"

type FiltersMenuProps = {
    filters: TaskFilters,
    handleFiltersChange: Dispatch<SetStateAction<TaskFilters>>,
    onClose: () => void,
    enableFilterByAssignedUser: boolean
}

export default function FiltersMenu({ filters, handleFiltersChange, onClose, enableFilterByAssignedUser }: FiltersMenuProps) {
    function updateFilters<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) {
        handleFiltersChange(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const { data: users = [], isPending, isError } = useUsers(enableFilterByAssignedUser)
    
    useEffect(() => {
        if (enableFilterByAssignedUser && isError) {
            handleFiltersChange(prev => {
                if (prev.assignedToUserId === null) {
                    return prev
                }

                return {
                    ...prev,
                    assignedToUserId: null
                }
            })
        }
    }, [isError, enableFilterByAssignedUser, handleFiltersChange])

    const inputClass = `w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 
    text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`

    return (
        <div 
            id="task-filters-menu"
            className="absolute right-0 z-50 mt-2 w-[min(340px,calc(100vw-2rem))] 
            rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filter tasks</h3>
                <button
                    aria-label="Close filters"
                    onClick={() => onClose()}
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="space-y-4">
                { enableFilterByAssignedUser && (
                    //Assigned to user 
                    <div>
                        <label 
                            htmlFor="task-assignee"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Assigned to
                        </label>
                        <select 
                            id="task-assignee"
                            value={filters.assignedToUserId ?? "all"}
                            onChange={e => (
                                updateFilters(
                                    "assignedToUserId",
                                    e.target.value === "all" ? null : Number(e.target.value)
                                )
                            )}
                            className={inputClass}
                        >
                            <option value="all">All users</option>

                            {!isPending && !isError && users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>

                        {isPending && (
                            <p className="mt-1 text-xs text-gray-400">
                                Loading users...
                            </p>
                        )}

                        {isError && (
                            <p className="mt-1 text-xs text-gray-500">
                                User list unavailable.
                            </p>
                        )}
                    </div>
                )}

                {/* Priority */}
                <div>
                    <label 
                        htmlFor="task-priority"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>
                    <select 
                        id="task-priority"
                        value={filters.priority}
                        onChange={e => (
                            updateFilters(
                                "priority", 
                                e.target.value as TaskFilters["priority"]
                            )
                        )}
                        className={inputClass}    
                    >
                        <option value="all">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* Deadline range */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Deadline range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="min-w-0">
                            <label 
                                htmlFor="task-deadline-from"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                From
                            </label>
                            <input 
                                id="task-deadline-from" 
                                type="date"
                                value={filters.dueDateFrom}
                                onChange={e => updateFilters("dueDateFrom", e.target.value )}
                                className={inputClass}
                            />
                        </div>
                        <div className="min-w-0">
                            <label 
                                htmlFor="task-deadline-to"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                To
                            </label>
                            <input
                                id="task-deadline-to"  
                                type="date" 
                                value={filters.dueDateTo}
                                onChange={e => updateFilters("dueDateTo", e.target.value )}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Sort by section */}
                <div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="min-w-0">
                            <label 
                                htmlFor="task-sort-by"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Sort by
                            </label>
                            <select 
                                id="task-sort-by"
                                value={filters.sortBy ?? "default"}
                                onChange={e => (
                                    updateFilters(
                                        "sortBy",
                                        e.target.value === "default" 
                                            ? null 
                                            : e.target.value as TaskFilters["sortBy"]
                                    )
                                )}
                                className={inputClass}
                            >
                                <option value="default">Default</option>
                                <option value="priority">Priority</option>
                                <option value="due_date">Due date</option>
                            </select>
                        </div>
                        <div className="min-w-0">
                            <label 
                                htmlFor="task-order"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Order
                            </label>
                            <select 
                                id="task-order"
                                value={filters.sortOrder}
                                onChange={e => (
                                    updateFilters(
                                        "sortOrder",
                                        e.target.value as TaskFilters["sortOrder"]
                                    )
                                )}
                                className={inputClass}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                        onClick={() => onClose()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 cursor-pointer"
                    >
                        Done
                    </button>
                    <button
                        onClick={() => handleFiltersChange({...defaultTaskFilters})}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    )
}