import { useState } from "react"
import UserMenu from "./UserMenu"
import { Outlet } from "react-router"
import OptionsPanel from "../../features/tasks/components/OptionsPanel"

export default function MainLayout() {
    const [isSideBarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="flex h-dvh overflow-hidden">
            <aside
                className={`
                    shrink-0 border-r border-gray-200
                    ${isSideBarCollapsed ? "w-18" : "w-48 xl:w-64"}
                `}
            >
                <OptionsPanel
                    isCollapsed={isSideBarCollapsed}
                    handleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
                />
            </aside>

            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 pt-3">
                <div className="flex shrink-0 justify-end">
                    <UserMenu />
                </div>

                <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}