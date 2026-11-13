import { X, Plus } from "lucide-react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { defaultTaskFormValues, type TaskFormValues } from "../types/taskForm"
import { allowedTaskPriorities, allowedTaskStatuses, createTask } from "../api/tasks"
import { useNavigate } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUsers } from "../../users/hooks/useUsers"
import { ApiError } from "../../../shared/api/api"

type TaskCreateModalProps = {
    onClose: () => void
}

const apiFieldToFormField = {
    title: "title",
    description: "description",
    assigned_to_user_id: "assignedToUserId",
    due_date: "dueDate",
    status: "status",
    priority: "priority"
} as const satisfies Record<string, keyof TaskFormValues>

export default function TaskCreateModal({ onClose }: TaskCreateModalProps) {
    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["tasks"]
            })
        }
    })

    const { data: users = [], isPending, isError } = useUsers()

    const modalRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const modal = modalRef.current

        if (!modal) return

        modal.showModal()

        return () => modal.close()
    }, [])

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormValues>({ 
        defaultValues: defaultTaskFormValues,
        mode: "onBlur"
    })

    const onSubmit: SubmitHandler<TaskFormValues> = async (data) => {
        clearErrors("root")

        const payload = {
            title: data.title.trim(),
            description: data.description.trim(),
            assigned_to_user_id: data.assignedToUserId ?? null,
            due_date: data.dueDate
                ? new Date(`${data.dueDate}T00:00:00`).toISOString()
                : null,
            status: data.status,
            priority: data.priority
        }

        try {
            await createTaskMutation.mutateAsync(payload)
            onClose()
        } catch(err) {
            if(err instanceof ApiError) {
                if(err.status === 401) {
                    navigate("/login", { replace: true })
                    return
                }

                if(err.fieldErrors) {
                    let hasFieldError = false

                    for(const [apiField, message] of Object.entries(err.fieldErrors)) {
                        if(apiField in apiFieldToFormField) {
                            const field = apiFieldToFormField[apiField as keyof typeof apiFieldToFormField]

                            setError(field, { type: "server", message })

                            hasFieldError = true
                        }
                    }

                    if(hasFieldError) return
                }
            }

            console.error("Failed to create task:", err)

            setError("root.serverError", {
                type: "server",
                message: "Something went wrong. Please try again."
            })
        }
    }

    const inputClass = `
        w-full min-w-0 rounded-lg border bg-white px-3 py-2
        text-sm text-gray-800 outline-none transition-colors
        placeholder:text-gray-400
    `

    const normalInputClass = `
        border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    `

    const errorInputClass = `
        border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100
    `

    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700"

    return createPortal(
        <dialog 
            className="fixed inset-0 m-auto h-screen w-screen max-h-none max-w-none bg-transparent p-4 backdrop:bg-black/50"
            ref={modalRef}
            onClose={onClose}
            aria-labelledby="create-task-title"
        >
            <div 
                className="flex min-h-full items-center justify-center"
                onMouseDown={e => {
                    if (e.target === e.currentTarget) {
                        onClose()
                    }
                }}    
            >
                <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <h2
                            id="create-task-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Create new task
                        </h2>

                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        {/* title */}
                        <div>
                            <label htmlFor="task-title" className={labelClass}>
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="task-title"
                                type="text" 
                                aria-required="true"
                                aria-invalid={!!errors.title}
                                className={`${inputClass} ${
                                    errors.title ? errorInputClass : normalInputClass
                                }`}
                                { ...register("title", {
                                    required: true,
                                    validate: value => value.trim().length > 0,
                                    maxLength: 255
                                }) }
                            />
                        </div>

                        {/* description */}
                        <div>
                            <label htmlFor="task-description" className={labelClass}>Description</label>
                            <textarea 
                                id="task-description"
                                rows={10}
                                className={`${inputClass} ${errors.description ? errorInputClass : normalInputClass} resize-y`}
                                { ...register("description") }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* assigned to */}
                            <div>
                                <label htmlFor="task-assignee" className={labelClass}>Assigned to</label>
                                <select 
                                    id="task-assignee"
                                    disabled={isPending || isError}
                                    aria-invalid={!!errors.assignedToUserId}
                                    className={`
                                        ${inputClass}
                                        ${errors.assignedToUserId
                                            ? errorInputClass
                                            : normalInputClass}
                                        disabled:bg-gray-100
                                    `}
                                    { ...register("assignedToUserId", {
                                        setValueAs: value => (value === "" || value === null ? null : Number(value))
                                    }) }
                                >
                                    <option value="">
                                        {isPending ? "Loading users..." : "Unassigned"}
                                    </option>

                                    {!isPending && !isError && users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Due date */}
                            <div>
                                <label htmlFor="task-due-date" className={labelClass}>Due date</label>
                                <input
                                    id="task-due-date"
                                    type="date"
                                    className={`${inputClass} ${errors.dueDate ? errorInputClass : normalInputClass}`}
                                    { ...register("dueDate") }
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="task-status" className={labelClass}>Status</label>
                                <select
                                    id="task-status"
                                    className={`${inputClass} ${errors.status ? errorInputClass : normalInputClass}`}
                                    { ...register("status", { 
                                        required: true,
                                        validate: value => (allowedTaskStatuses.includes(value))
                                    }) }
                                >
                                    <option value="todo">To do</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label htmlFor="task-priority" className={labelClass}>Priority</label>
                                <select
                                    id="task-priority"
                                    className={`${inputClass} ${errors.priority ? errorInputClass : normalInputClass}`}
                                    { ...register("priority", { 
                                        required: true,
                                        validate: value => (allowedTaskPriorities.includes(value))
                                    }) }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        {errors.root?.serverError && (
                            <p role="alert" className="text-sm text-red-600">
                                {errors.root.serverError.message}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                <Plus size={17} />
                                {isSubmitting ? "Creating..." : "Create task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>,
        document.body
    )
}