
import { useState } from "react"
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Settings,
} from "lucide-react"
import { NavLink } from "react-router"

type OptionsPanelProps = {
    isCollapsed: boolean
    handleCollapse: () => void
}

export default function OptionsPanel({
    isCollapsed,
    handleCollapse
}: OptionsPanelProps) {
    const [isProjectsOpen, setIsProjectsOpen] = useState(false)

    const navItemClass = (isActive: boolean) => `
        flex w-full items-center rounded-lg py-2.5
        text-sm font-medium transition-colors cursor-pointer
        ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"}
        ${isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
    `

    return (
        <div
            className={`
                flex h-full flex-col justify-between bg-gray-50 py-4
                ${isCollapsed ? "px-2" : "px-4"}
            `}
        >
            <div>
                <div
                    className={`
                        mb-8 flex h-10 items-center
                        ${isCollapsed
                            ? "justify-center"
                            : "justify-between gap-2 pl-2"
                        }
                    `}
                >
                    {!isCollapsed && (
                        <h1 className="min-w-0 text-xl font-bold tracking-tight text-gray-900">
                            TaskTracker
                        </h1>
                    )}

                    <button
                        type="button"
                        onClick={handleCollapse}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!isCollapsed}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 cursor-pointer"
                    >
                        {isCollapsed
                            ? <ChevronRight size={20} />
                            : <ChevronLeft size={20} />
                        }
                    </button>
                </div>

                <nav className="space-y-1">
                    <NavLink
                        to="/dashboard"
                        title="Dashboard"
                        className={({ isActive }) => navItemClass(isActive)}
                    >
                        <LayoutDashboard size={20} className="shrink-0" />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>

                    <NavLink
                        to="/my-tasks"
                        title="My tasks"
                        className={({ isActive }) => navItemClass(isActive)}
                    >
                        <ListTodo size={20} className="shrink-0" />
                        {!isCollapsed && <span>My tasks</span>}
                    </NavLink>

                    <button
                        type="button"
                        title="Projects"
                        onClick={() => setIsProjectsOpen(prev => !prev)}
                        aria-expanded={isProjectsOpen}
                        className={`
                            flex w-full items-center rounded-lg py-2.5
                            text-sm font-medium text-gray-600
                            transition-colors hover:bg-gray-100
                            hover:text-gray-900 cursor-pointer
                            ${isCollapsed
                                ? "justify-center px-2"
                                : "justify-between px-3"
                            }
                        `}
                    >
                        <span
                            className={`flex items-center ${
                                isCollapsed ? "" : "gap-3"
                            }`}
                        >
                            <FolderKanban size={20} className="shrink-0" />
                            {!isCollapsed && <span>Projects</span>}
                        </span>

                        {!isCollapsed && (
                            isProjectsOpen
                                ? <ChevronDown size={16} />
                                : <ChevronRight size={16} />
                        )}
                    </button>

                    {isProjectsOpen && !isCollapsed && (
                        <div className="py-2">
                            <p className="text-center text-xs text-gray-400">
                                No projects yet
                            </p>
                        </div>
                    )}
                </nav>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <NavLink
                    to="/settings"
                    title="Settings"
                    className={({ isActive }) => navItemClass(isActive)}
                >
                    <Settings size={20} className="shrink-0" />
                    {!isCollapsed && <span>Settings</span>}
                </NavLink>
            </div>
        </div>
    )
}
