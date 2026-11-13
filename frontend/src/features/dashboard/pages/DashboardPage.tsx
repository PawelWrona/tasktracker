import { useEffect, useMemo, useState } from "react";
import { defaultTaskFilters, type TaskFilters } from "../../tasks/types/taskFilters";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/api";
import { filterAndSortTasks } from "../../tasks/utils/filterAndSortTasks";
import { getTasks } from "../../tasks/api/tasks";
import TaskToolbar from "../../tasks/components/TaskToolbar";
import TaskDashboard from "../../tasks/components/TaskDashboard";

export default function DashboardPage() {
    const [tasksFilters, setTasksFilters] = useState<TaskFilters>(defaultTaskFilters)

    const navigate = useNavigate()

    const { data: tasks = [], isPending, isError, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: getTasks
    })

    useEffect(() => {
        if (error instanceof ApiError && error.status === 401) {
            navigate("/login", { replace: true })
        }
    }, [error, navigate])

    const filteredTasks = useMemo(() => {
        return filterAndSortTasks(tasks, tasksFilters)
    }, [tasks, tasksFilters])

    if (isPending) {
        return <div>Loadings tasks...</div>
    }

    return (
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3">
            <div className="shrink-0">
                <TaskToolbar
                    filters={tasksFilters}
                    handleFiltersChange={setTasksFilters}
                    isCreateBtnVisible={true}
                    enableFilterByAssignedUser={true}
                />
            </div>

            <div className="min-h-0 flex-1">
                <TaskDashboard
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