
import { useForm, type SubmitHandler } from "react-hook-form"
import { defaultChangePasswordFormValues, type ChangePasswordFormValues } from "../types/changePasswordForm"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { changePassword } from "../api/users"
import { useNavigate } from "react-router"
import { ApiError } from "../../../shared/api/api"
import { useState } from "react"
import PasswordInput from "../../../shared/components/PasswordInput"
import { tokenStore } from "../../../shared/api/tokenStore"

const apiFieldToFormField = {
    currentPassword: "currentPassword",
    newPassword: "newPassword"
} as const satisfies Record<string, keyof ChangePasswordFormValues>

export default function ChangePasswordForm() {
    const [successMessage, setSuccessMessage] = useState("")

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        clearErrors,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ChangePasswordFormValues>({
        defaultValues: defaultChangePasswordFormValues,
        mode: "onBlur"
    })

    const changePasswordMutation = useMutation({
        mutationFn: changePassword
    })

    const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
        clearErrors("root")
        setSuccessMessage("")

        const payload = {
            current_password: data.currentPassword,
            new_password: data.newPassword
        }

        try {
            await changePasswordMutation.mutateAsync(payload)
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    tokenStore.clear()
                    queryClient.clear()

                    navigate("/login", {
                        replace: true,
                        state: {
                            errorMessage: "Your session has expired. Please sign in again."
                        }
                    })

                    return
                }

                if (err.fieldErrors) {
                    let hasFieldError = false

                    for (const [apiField, message] of Object.entries(err.fieldErrors)) {
                        if (apiField in apiFieldToFormField) {
                            const field = apiFieldToFormField[
                                apiField as keyof typeof apiFieldToFormField
                            ]

                            setError(field, {
                                type: "server",
                                message
                            })

                            hasFieldError = true
                        }
                    }

                    if (hasFieldError) return
                }
            }

            setError("root.serverError", {
                type: "server",
                message: "Something went wrong. Please try again."
            })

            return
        }

        reset()
        tokenStore.clear()
        queryClient.clear()

        navigate("/login", {
            replace: true,
            state: {
                successMessage: "Password changed successfully. Please sign in again."
            }
        })
    }

    const inputClass = `
        w-full rounded-lg border
        bg-surface px-3 py-2.5
        text-sm text-foreground
        outline-none transition-colors
        placeholder:text-text-subtle
    `

    const labelClass = `
        mb-1.5 block text-sm font-medium text-text-secondary
    `

    const normalInputClass = `
        border-border
        focus:border-primary
        focus:ring-2 focus:ring-primary/20
    `

    const errorInputClass = `
        border-danger
        focus:border-danger
        focus:ring-2 focus:ring-danger/20
    `

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
        >
            <div>
                <label
                    htmlFor="current-password"
                    className={labelClass}
                >
                    Current password
                </label>

                <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    className={`${inputClass} ${
                        errors.currentPassword
                            ? errorInputClass
                            : normalInputClass
                    }`}
                    {...register("currentPassword", {
                        required: "Current password is required"
                    })}
                />

                <p className="mt-1.5 text-xs text-danger">
                    {errors.currentPassword?.message}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="new-password"
                        className={labelClass}
                    >
                        New password
                    </label>

                    <PasswordInput
                        id="new-password"
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        className={`${inputClass} ${
                            errors.newPassword
                                ? errorInputClass
                                : normalInputClass
                        }`}
                        {...register("newPassword", {
                            required: "New password is required",
                            minLength: {
                                value: 8,
                                message: "Minimum 8 characters"
                            },
                            pattern: {
                                value: /\d/,
                                message: "Password must contain at least one digit"
                            }
                        })}
                    />

                    <p className="mt-1.5 text-xs text-danger">
                        {errors.newPassword?.message}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className={labelClass}
                    >
                        Confirm password
                    </label>

                    <PasswordInput
                        id="confirm-password"
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className={`${inputClass} ${
                            errors.confirmPassword
                                ? errorInputClass
                                : normalInputClass
                        }`}
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: value =>
                                value === getValues("newPassword") ||
                                "Passwords do not match"
                        })}
                    />

                    <p className="mt-1.5 text-xs text-danger">
                        {errors.confirmPassword?.message}
                    </p>
                </div>
            </div>

            {errors.root?.serverError?.message && (
                <p role="alert" className="text-sm text-danger">
                    {errors.root.serverError.message}
                </p>
            )}

            {successMessage && (
                <p
                    role="status"
                    className="rounded-lg bg-success/10 p-3 text-sm text-success"
                >
                    {successMessage}
                </p>
            )}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                        cursor-pointer rounded-lg
                        bg-primary px-4 py-2.5
                        text-sm font-semibold text-primary-foreground
                        transition-colors
                        hover:bg-primary-hover
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {isSubmitting ? "Updating..." : "Update password"}
                </button>
            </div>
        </form>
    )
}
