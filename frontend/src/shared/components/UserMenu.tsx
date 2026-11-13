import { UserRound, Settings, LogOut } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { logout } from "../../features/auth/api/auth"
import { ApiError } from "../api/api"

export default function UserMenu() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const userButtonRef = useRef<HTMLButtonElement>(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const navigate = useNavigate()

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

    return (
        <div className="relative" ref={userMenuRef}>
            <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="rounded-full bg-gray-100 text-gray-500 p-2 cursor-pointer hover:bg-gray-200"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
                ref={userButtonRef}
            >
                <UserRound size={20} />
            </button>
            { isUserMenuOpen && (
                <div 
                    className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
                >
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 
                        text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        <Settings size={17} />
                        Settings
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 
                        text-left text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={logoutAction}
                        disabled={isLoggingOut}
                    >
                        <LogOut size={17} />
                        { isLoggingOut ? "Logging out" : "Log out" }
                    </button>
                </div>
            )}
        </div>
    )
}