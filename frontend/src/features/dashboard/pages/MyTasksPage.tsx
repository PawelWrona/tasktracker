import { useEffect, useMemo, useState } from "react"
import { defaultTaskFilters, type TaskFilters } from "../../tasks/types/taskFilters"
import { filterAndSortTasks } from "../../tasks/utils/filterAndSortTasks"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ApiError } from "../../../shared/api/api"
import { getMyTasks } from "../../tasks/api/tasks"
import TaskToolbar from "../../tasks/components/TaskToolbar"
import MyTaskDashboard from "../../tasks/components/MyTaskDashboard"

export default function MyTasksPage() {
    const [tasksFilters, setTasksFilters] = useState<TaskFilters>(defaultTaskFilters)

    const navigate = useNavigate()

    const { data: tasks = [], isPending, isError, error } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: ({signal}) => getMyTasks(signal)
    })

    useEffect(() => {
        if (error instanceof ApiError && error.status === 401) {
            navigate("/login", { replace: true })
        }
    }, [error, navigate])

    const filteredTasks = useMemo(() => {
        return filterAndSortTasks(tasks, tasksFilters, { enableFilterByAssignedUser: false })
    }, [tasks, tasksFilters])

    if (isPending) {
        return <div>Loadings tasks...</div>
    }

    return (
            <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-3">
                <div className="shrink-0">
                    <TaskToolbar
                        filters={tasksFilters}
                        handleFiltersChange={setTasksFilters}
                        isCreateBtnVisible={false}
                        enableFilterByAssignedUser={false}
                    />
                </div>
    
                <div className="min-h-0 flex-1">
                    <MyTaskDashboard
                        tasks={filteredTasks}
                        fetchingError={
                            isError
                                ? "An error occurred while trying to fetch tasks"
                                : ""
                        }
                    />
                </div>
            </div>
        )
}