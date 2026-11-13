
import {
    UserRound,
    LockKeyhole,
    Palette,
    Link2,
    Sun,
    Moon,
    Monitor
} from "lucide-react"

export default function SettingsPage() {
    const cardClass =
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"

    const inputClass = `
        w-full rounded-lg border border-gray-300
        bg-white px-3 py-2.5 text-sm text-gray-800
        outline-none transition-colors
        placeholder:text-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    `

    const labelClass =
        "mb-1.5 block text-sm font-medium text-gray-700"

    const secondaryButtonClass = `
        cursor-pointer rounded-lg border border-gray-300
        bg-white px-4 py-2 text-sm font-medium text-gray-700
        transition-colors hover:bg-gray-50
    `

    return (
        <div className="h-full min-h-0 overflow-y-auto pb-6">
            <div className="mx-auto max-w-4xl space-y-6 py-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile */}
                <section className={cardClass}>
                    <div className="mb-5 flex items-center gap-2">
                        <UserRound size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Profile
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <UserRound
                                size={36}
                                className="text-blue-600"
                                strokeWidth={1.5}
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900">
                                Profile icon
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose an icon for your account.
                            </p>

                            <button
                                type="button"
                                className={`mt-3 ${secondaryButtonClass}`}
                            >
                                Change icon
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className={cardClass}>
                    <div className="mb-2 flex items-center gap-2">
                        <LockKeyhole size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Security
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="current-password"
                                className={labelClass}
                            >
                                Current password
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter current password"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="new-password"
                                    className={labelClass}
                                >
                                    New password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className={labelClass}
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                Update password
                            </button>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className={cardClass}>
                    <div className="mb-2 flex items-center gap-2">
                        <Palette size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Appearance
                        </h2>
                    </div>

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
                </section>

                {/* Connected accounts */}
                {/* <section className={cardClass}>
                    <div className="mb-2 flex items-center gap-2">
                        <Link2 size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Connected accounts
                        </h2>
                    </div>

                    <p className="mb-6 text-sm text-gray-500">
                        Manage your linked external accounts.
                    </p>
                </section> */}
            </div>
        </div>
    )
}
