
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "../../../shared/theme/ThemeProvider"

export default function ChangeThemePanel() {
    const { theme, setTheme } = useTheme()

    const themes = [
        { value: "light", label: "Light", Icon: Sun },
        { value: "dark", label: "Dark", Icon: Moon },
        { value: "system", label: "System", Icon: Monitor }
    ] as const

    const activeThemeStyles = `
        border-primary ring-2 ring-primary/30
    `

    const inactiveThemeStyles = `
        border-border hover:border-primary/60
    `

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {themes.map(({ value, label, Icon }) => {
                const isActive = theme === value

                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setTheme(value)}
                        className={`
                            cursor-pointer rounded-xl border
                            bg-surface p-3 text-left
                            transition-colors
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-primary
                            ${isActive
                                ? activeThemeStyles
                                : inactiveThemeStyles
                            }
                        `}
                    >
                        {value === "light" && (
                            <div className="h-24 rounded-lg bg-gray-100 p-3">
                                <div className="mb-2 h-3 w-1/2 rounded bg-white" />
                                <div className="h-10 rounded bg-white shadow-sm" />
                            </div>
                        )}

                        {value === "dark" && (
                            <div className="h-24 rounded-lg bg-[#101b2b] p-3">
                                <div className="mb-2 h-3 w-1/2 rounded bg-[#34475e]" />
                                <div className="h-10 rounded bg-[#172537] shadow-sm" />
                            </div>
                        )}

                        {value === "system" && (
                            <div className="flex h-24 overflow-hidden rounded-lg">
                                <div className="w-1/2 bg-gray-100 p-2">
                                    <div className="mb-2 h-3 rounded bg-white" />
                                    <div className="h-10 rounded bg-white" />
                                </div>

                                <div className="w-1/2 bg-[#101b2b] p-2">
                                    <div className="mb-2 h-3 rounded bg-[#34475e]" />
                                    <div className="h-10 rounded bg-[#172537]" />
                                </div>
                            </div>
                        )}

                        <div
                            className={`
                                mt-3 flex items-center gap-2
                                text-sm font-medium
                                ${isActive
                                    ? "text-primary"
                                    : "text-text-secondary"
                                }
                            `}
                        >
                            <Icon size={17} />
                            {label}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
