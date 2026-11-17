
import { useActionState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { ApiError, type FieldErrors } from "../../../shared/api/api"
import { login } from "../api/auth"

type FormState = {
    message: string
    errors?: FieldErrors
    email: string
}

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const successMessage = location.state?.successMessage

    async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
        const email = String(formData.get("email"))
        const password = String(formData.get("password"))

        const errors: FieldErrors = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!email) {
            errors.email = "Email is required"
        } else if (!emailRegex.test(email)) {
            errors.email = "Invalid email address"
        }

        if (!password) {
            errors.password = "Password is required"
        }

        if (Object.keys(errors).length > 0) {
            return { message: "", errors, email }
        }

        try {
            await login({ email, password })

            navigate("/")

            return { message: "", email: "" }
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 400) {
                    return {
                        message: "",
                        errors: err.fieldErrors,
                        email
                    }
                }

                if (err.status === 401) {
                    return { message: "Invalid email or password.", email }
                }
            }

            return {
                message: "Something went wrong. Please try again.",
                email
            }
        }
    }

    const [state, formAction, isPending] = useActionState(
        loginAction,
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
            flex min-h-dvh flex-col items-center justify-center
            bg-surface-muted px-4 py-8
        ">
            {successMessage && (
                <p
                    role="status"
                    className="
                        mb-4 rounded-lg
                        bg-success/10 p-3
                        text-sm text-success
                    "
                >
                    {successMessage}
                </p>
            )}

            <div className="
                w-full max-w-md rounded-xl
                border border-border
                bg-surface p-8 shadow-sm
            ">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-text-muted">
                        Sign in to your account to continue
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
                            defaultValue={state.email}
                            autoComplete="email"
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
                            autoComplete="current-password"
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
                        {isPending ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Sign up */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-muted">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="
                                font-semibold text-primary
                                hover:text-primary-hover
                                hover:underline
                            "
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
