
import { UserRound, Settings, LogOut } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { logout } from "../../features/auth/api/auth"
import { ApiError } from "../api/api"
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser"

export default function UserMenu() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const userButtonRef = useRef<HTMLButtonElement>(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const navigate = useNavigate()

    const {data: user, isPending, isError} = useCurrentUser()

    useEffect(() => {
        if (!isUserMenuOpen) return

        function handleClickOutside(e: PointerEvent) {
            if (
                userMenuRef.current &&
                e.target instanceof Node &&
                !userMenuRef.current.contains(e.target)
            ) {
                setIsUserMenuOpen(false)
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsUserMenuOpen(false)
                userButtonRef.current?.focus()
            }
        }

        document.addEventListener("pointerdown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isUserMenuOpen])

    async function logoutAction() {
        if (isLoggingOut) return

        setIsLoggingOut(true)

        try {
            await logout()
        } catch (err) {
            if (err instanceof ApiError) {
                console.error("Logout API error:", err.status)
            } else {
                console.error("Logout network error:", err)
            }
        } finally {
            navigate("/login", { replace: true })
        }
    }

    function handleSettingsClick() {
        setIsUserMenuOpen(false)
        navigate("/settings")
    }

    return (
        <div className="relative" ref={userMenuRef}>
            <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                ref={userButtonRef}
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
                className="
                    flex h-10 w-10 cursor-pointer
                    items-center justify-center
                    overflow-hidden rounded-full
                    bg-surface-muted text-text-muted
                    hover:bg-surface-hover
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary/40
                "
            >
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt="User avatar"
                        className="h-9 w-9 rounded-full object-cover"
                    />
                ) : (
                    <UserRound size={20} />
                )}
            </button>

            {isUserMenuOpen && (
                <div
                    className="
                        absolute right-0 z-50 mt-2 w-48
                        rounded-xl border border-border
                        bg-surface p-2 shadow-lg
                    "
                >
                    <div className="px-3 py-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {isPending
                                ? "Loading..."
                                : isError
                                    ? "User unavailable"
                                    : user?.name}
                        </p>

                        <p className="truncate text-xs text-text-muted pt-1">
                            {user?.email}
                        </p>
                    </div>

                    <div className="my-1 border-t border-border-subtle" />

                    <button
                        type="button"
                        onClick={handleSettingsClick}
                        className="
                            flex w-full cursor-pointer items-center
                            gap-3 rounded-lg px-3 py-2
                            text-left text-sm text-text-secondary
                            transition-colors
                            hover:bg-surface-hover
                            hover:text-foreground
                        "
                    >
                        <Settings size={17} />
                        Settings
                    </button>

                    <div className="my-1 border-t border-border-subtle" />

                    <button
                        type="button"
                        onClick={logoutAction}
                        disabled={isLoggingOut}
                        className="
                            flex w-full cursor-pointer items-center
                            gap-3 rounded-lg px-3 py-2
                            text-left text-sm text-danger
                            transition-colors
                            hover:bg-danger/10
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <LogOut size={17} />
                        {isLoggingOut ? "Logging out" : "Log out"}
                    </button>
                </div>
            )}
        </div>
    )
}
