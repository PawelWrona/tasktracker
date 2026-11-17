
import { useActionState } from "react"
import { Link, useNavigate } from "react-router"
import { ApiError, type FieldErrors } from "../../../shared/api/api"
import { register } from "../api/auth"

type FormState = {
    message: string
    errors?: FieldErrors
    email: string
}

export default function RegisterPage() {
    const navigate = useNavigate()

    async function registerAction(_prevState: FormState, formData: FormData): Promise<FormState> {
        const email = String(formData.get("email"))
        const password = String(formData.get("password"))
        const confirmPassword = String(formData.get("confirmPassword"))

        const errors: FieldErrors = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!email) {
            errors.email = "Email is required"
        } else if (!emailRegex.test(email)) {
            errors.email = "Invalid email address"
        }

        if (!password) {
            errors.password = "Password is required"
        } else if (password.length < 8) {
            errors.password = "Password must be at least 8 characters long"
        } else if (!/\d/.test(password)) {
            errors.password = "Password must contain at least one digit"
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }

        if (Object.keys(errors).length > 0) {
            return { message: "", errors, email }
        }

        try {
            await register({ email, password })

            navigate("/login")

            return { message: "", email }
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 400) {
                    return {
                        message: "",
                        errors: err.fieldErrors,
                        email
                    }
                }

                if (err.status === 409) {
                    return {
                        message: "User with this email already exists",
                        email
                    }
                }
            }

            return {
                message: "Something went wrong. Please try again.",
                email
            }
        }
    }

    const [state, formAction, isPending] = useActionState(
        registerAction,
        { message: "", email: "" }
    )

    const inputClass = `
        w-full rounded-lg border
        bg-surface px-3 py-2.5
        text-sm text-foreground
        outline-none transition-colors
        placeholder:text-text-subtle
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

    const labelClass = `
        mb-1.5 block text-sm font-medium text-text-secondary
    `

    return (
        <div className="
            flex min-h-dvh items-center justify-center
            bg-surface-muted px-4 py-8
        ">
            <div className="
                w-full max-w-md rounded-xl
                border border-border
                bg-surface p-8 shadow-sm
            ">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                        Create an account
                    </h1>

                    <p className="mt-2 text-sm text-text-muted">
                        Sign up to get started
                    </p>
                </div>

                {/* Form */}
                <form action={formAction} noValidate className="space-y-5">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className={labelClass}>
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            defaultValue={state.email}
                            required
                            aria-invalid={!!state.errors?.email}
                            aria-describedby={
                                state.errors?.email ? "email-error" : undefined
                            }
                            className={`${inputClass} ${
                                state.errors?.email
                                    ? errorInputClass
                                    : normalInputClass
                            }`}
                        />

                        {state.errors?.email && (
                            <p
                                id="email-error"
                                role="alert"
                                className="mt-1.5 text-xs text-danger"
                            >
                                {state.errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className={labelClass}>
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="new-password"
                            required
                            aria-invalid={!!state.errors?.password}
                            aria-describedby={
                                state.errors?.password
                                    ? "password-error"
                                    : undefined
                            }
                            className={`${inputClass} ${
                                state.errors?.password
                                    ? errorInputClass
                                    : normalInputClass
                            }`}
                        />

                        {state.errors?.password && (
                            <p
                                id="password-error"
                                role="alert"
                                className="mt-1.5 text-xs text-danger"
                            >
                                {state.errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className={labelClass}>
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                            aria-invalid={!!state.errors?.confirmPassword}
                            aria-describedby={
                                state.errors?.confirmPassword
                                    ? "confirm-password-error"
                                    : undefined
                            }
                            className={`${inputClass} ${
                                state.errors?.confirmPassword
                                    ? errorInputClass
                                    : normalInputClass
                            }`}
                        />

                        {state.errors?.confirmPassword && (
                            <p
                                id="confirm-password-error"
                                role="alert"
                                className="mt-1.5 text-xs text-danger"
                            >
                                {state.errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Server error */}
                    {state.message && (
                        <p
                            role="alert"
                            className="
                                rounded-lg bg-danger/10
                                px-3 py-2 text-sm text-danger
                            "
                        >
                            {state.message}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="
                            w-full cursor-pointer rounded-lg
                            bg-primary px-4 py-2.5
                            text-sm font-semibold text-primary-foreground
                            transition-colors
                            hover:bg-primary-hover
                            focus-visible:outline-2
                            focus-visible:outline-offset-2
                            focus-visible:outline-primary
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {isPending ? "Signing up..." : "Sign up"}
                    </button>
                </form>

                {/* Sign in */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-muted">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="
                                font-semibold text-primary
                                hover:text-primary-hover
                                hover:underline
                            "
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
