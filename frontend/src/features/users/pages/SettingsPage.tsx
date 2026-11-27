import {
    UserRound,
    Palette,
    LockKeyhole
} from "lucide-react"

import ChangePasswordForm from "../components/ChangePasswordForm"
import ChangeThemePanel from "../components/ChangeThemePanel"
import { ChangeAvatarPanel } from "../components/ChangeAvatarPanel"

export default function SettingsPage() {
    const cardClass = `
        rounded-xl border border-border
        bg-surface p-6 shadow-sm
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
                        <UserRound size={20} className="text-primary"/>

                        <h2 className="text-lg font-semibold text-foreground">
                            Profile
                        </h2>
                    </div>

                    <ChangeAvatarPanel />
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
