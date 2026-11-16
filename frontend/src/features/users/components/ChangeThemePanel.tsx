import {
    Sun,
    Moon,
    Monitor,
} from "lucide-react"
import { useTheme } from "../../../shared/theme/ThemeProvider"

export default function ChangeThemePanel() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Light theme */}
            <div className="rounded-xl border-2 border-blue-500 p-3">
                <div className="h-24 rounded-lg bg-gray-100 p-3">
                    <div className="mb-2 h-3 w-1/2 rounded bg-white" />
                    <div className="h-10 rounded bg-white shadow-sm" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Sun size={17} />
                    Light
                </div>
            </div>

            {/* Dark theme */}
            <div className="rounded-xl border border-gray-200 p-3">
                <div className="h-24 rounded-lg bg-gray-900 p-3">
                    <div className="mb-2 h-3 w-1/2 rounded bg-gray-700" />
                    <div className="h-10 rounded bg-gray-800" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Moon size={17} />
                    Dark
                </div>
            </div>

            {/* System theme */}
            <div className="rounded-xl border border-gray-200 p-3">
                <div className="flex h-24 overflow-hidden rounded-lg">
                    <div className="w-1/2 bg-gray-100 p-2">
                        <div className="mb-2 h-3 rounded bg-white" />
                        <div className="h-10 rounded bg-white" />
                    </div>
                    <div className="w-1/2 bg-gray-900 p-2">
                        <div className="mb-2 h-3 rounded bg-gray-700" />
                        <div className="h-10 rounded bg-gray-800" />
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Monitor size={17} />
                    System
                </div>
            </div>
        </div>
    )
}