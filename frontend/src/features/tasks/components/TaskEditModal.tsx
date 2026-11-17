import { X } from "lucide-react"
import { createPortal } from "react-dom";
import { useUsers } from "../../users/hooks/useUsers";
import { useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { type TaskFormValues } from "../types/taskForm";
import { allowedTaskPriorities, allowedTaskStatuses, updateTask, type Task } from "../api/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/api";
import { useNavigate } from "react-router";

type TaskEditModalProps = {
    taskData: Task,
    onClose: () => void,
    tasksQueryKey: string,
}

const apiFieldToFormField = {
    title: "title",
    description: "description",
    assigned_to_user_id: "assignedToUserId",
    due_date: "dueDate",
    status: "status",
    priority: "priority"
} as const satisfies Record<string, keyof TaskFormValues>

export default function TaskEditModal({ taskData, onClose, tasksQueryKey }: TaskEditModalProps) {
    const navigate = useNavigate()

    const queryClient = useQueryClient()
    const editTaskMutation = useMutation({
        mutationFn: updateTask,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [tasksQueryKey] })
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = taskData.due_date ? new Date(taskData.due_date) : null
    const isOverdue = (
        dueDate !== null &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < today &&
        taskData.status !== "done"
    )

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<TaskFormValues>({
        defaultValues: {
            title: taskData.title,
            description: taskData.description ?? "",
            assignedToUserId: taskData.assigned_to_user_id ?? null,
            dueDate: taskData.due_date ? taskData.due_date.slice(0, 10) : "",
            status: taskData.status,
            priority: taskData.priority
        },
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
            await editTaskMutation.mutateAsync({request: payload, taskId: taskData.id})
            onClose()
        } catch(err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    navigate("/login", { replace: true })
                    return
                }

                if (err.fieldErrors) {
                    let hasFieldError = false

                    for(const [apiField, message] of Object.entries(err.fieldErrors)) {
                        if (apiField in apiFieldToFormField) {
                            const field = apiFieldToFormField[apiField as keyof typeof apiFieldToFormField]

                            setError(field, { type: "server", message })

                            hasFieldError = true
                        }
                    }

                    if(hasFieldError) return
                }
            }

            console.error("Failed to update task:", err)

            setError("root.serverError", {
                type: "server",
                message: "Something went wrong. Please try again."
            })
        }
    }

    const inputClass = `
        w-full min-w-0 rounded-lg border bg-surface px-3 py-2
        text-sm text-foreground outline-none transition-colors
        placeholder:text-text-subtle
    `

    const normalInputClass = `
        border-border focus:border-primary focus:ring-2 focus:ring-primary/20
    `

    const errorInputClass = `
        border-danger focus:border-danger focus:ring-2 focus:ring-danger/20
    `

    const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary"

    return createPortal(
        <dialog 
            className="fixed inset-0 m-auto h-screen w-screen max-h-none max-w-none bg-transparent p-4 backdrop:bg-black/50"
            ref={modalRef}
            onClose={onClose}
            aria-labelledby="edit-task-title"
        >
            <div 
                className="flex min-h-full items-center justify-center"
                onMouseDown={e => {
                    if (e.target === e.currentTarget) {
                        onClose()
                    }
                }}    
            >
                <div className="w-full max-w-xl rounded-xl bg-surface p-6 shadow-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <h2
                            id="edit-task-title"
                            className="text-xl font-semibold text-foreground"
                        >
                            Edit task
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close modal"
                            className="cursor-pointer rounded-lg p-2 text-text-muted hover:bg-surface-hover"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        {/* title */}
                        <div>
                            <label htmlFor="task-title" className={labelClass}>
                                Title <span className="text-danger">*</span>
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
                                        disabled:bg-surface-muted
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
                                    className={`
                                        ${inputClass} 
                                        ${errors.dueDate ? errorInputClass : normalInputClass}
                                        ${isOverdue ? "shadow-[0_0_12px_2px] shadow-danger/20" : ""}
                                    `}
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
                            <p role="alert" className="text-sm text-danger">
                                {errors.root.serverError.message}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 border-t border-border-subtle pt-5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>,
        document.body
    )
}