
import {
    UserRound,
    Palette,
    LockKeyhole
} from "lucide-react"

import ChangePasswordForm from "../components/ChangePasswordForm"
import ChangeThemePanel from "../components/ChangeThemePanel"

export default function SettingsPage() {
    const cardClass = `
        rounded-xl border border-border
        bg-surface p-6 shadow-sm
    `

    const secondaryButtonClass = `
        cursor-pointer rounded-lg
        border border-border
        bg-surface px-4 py-2
        text-sm font-medium text-text-secondary
        transition-colors
        hover:bg-surface-hover
        hover:text-foreground
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary/40
    `

    return (
        <div className="h-full min-h-0 overflow-y-auto pb-6">
            <div className="mx-auto max-w-4xl space-y-6 py-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Settings
                    </h1>

                    <p className="mt-1 text-sm text-text-muted">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile */}
                <section className={cardClass}>
                    <div className="mb-5 flex items-center gap-2">
                        <UserRound
                            size={20}
                            className="text-primary"
                        />

                        <h2 className="text-lg font-semibold text-foreground">
                            Profile
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                        <div
                            className="
                                flex h-20 w-20 shrink-0
                                items-center justify-center
                                rounded-full bg-primary/15
                            "
                        >
                            <UserRound
                                size={36}
                                className="text-primary"
                                strokeWidth={1.5}
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-foreground">
                                Profile icon
                            </h3>

                            <p className="mt-1 text-sm text-text-muted">
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
                        <LockKeyhole
                            size={20}
                            className="text-primary"
                        />

                        <h2 className="text-lg font-semibold text-foreground">
                            Security
                        </h2>
                    </div>

                    <ChangePasswordForm />
                </section>

                {/* Appearance */}
                <section className={cardClass}>
                    <div className="mb-2 flex items-center gap-2">
                        <Palette
                            size={20}
                            className="text-primary"
                        />

                        <h2 className="text-lg font-semibold text-foreground">
                            Appearance
                        </h2>
                    </div>

                    <ChangeThemePanel />
                </section>

            </div>
        </div>
    )
}
