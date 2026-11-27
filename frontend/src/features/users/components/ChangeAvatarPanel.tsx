import { useEffect, useRef, useState } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { UserRound, Upload } from "lucide-react"
import { changeAvatar } from "../api/users"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function ChangeAvatarPanel() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState("")

    const fileInputRef = useRef<HTMLInputElement>(null)

    const {data: user} = useCurrentUser()

    const queryClient = useQueryClient()

    useEffect(() => {
        if(!selectedFile) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [selectedFile])

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if (!allowedTypes.includes(file.type)) {
            setError("Please select a JPG, PNG or WebP image.")
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be smaller than 2 MB.")
            return
        }

        setError("")
        setSelectedFile(file)
    }

    function cancelSelection() {
        setSelectedFile(null)
        setError("")

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const changeAvatarMutation = useMutation({
        mutationFn: changeAvatar,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["currentUser"]
            })
        }
    })

    async function handleSave() {
        if (!selectedFile || changeAvatarMutation.isPending) return

        try{
            await changeAvatarMutation.mutateAsync(selectedFile)
            cancelSelection()
        } catch(err) {

        }
    }

    const displayedAvatar = previewUrl ?? user?.avatar_url

    return (
        <div className="flex flex-wrap items-center gap-5">
            <div
                className="
                    flex h-20 w-20 shrink-0
                    items-center justify-center
                    overflow-hidden rounded-full
                    bg-primary/15
                "
            >
                {displayedAvatar ? (
                    <img
                        src={displayedAvatar}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <UserRound
                        size={36}
                        className="text-primary"
                        strokeWidth={1.5}
                    />
                )}
            </div>

            <div>
                <h3 className="text-sm font-medium text-foreground">
                    Profile picture
                </h3>

                <p className="my-2 text-sm text-text-muted">
                    Choose a picture for your account.
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Choose profile picture"
                />

                {selectedFile ? (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={changeAvatarMutation.isPending}
                            className="
                                rounded-lg bg-primary px-4 py-2
                                text-sm font-medium text-primary-foreground
                                disabled:opacity-60
                            "
                        >
                            {changeAvatarMutation.isPending
                                ? "Saving..."
                                : "Save photo"}
                        </button>

                        <button
                            type="button"
                            onClick={cancelSelection}
                            disabled={changeAvatarMutation.isPending}
                            className="
                                rounded-lg border border-border
                                px-4 py-2 text-sm
                                text-text-secondary
                                disabled:opacity-60
                            "
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="
                            inline-flex items-center gap-2
                            rounded-lg border border-border
                            px-4 py-2 text-sm font-medium
                            text-text-secondary
                            hover:bg-surface-hover
                        "
                    >
                        <Upload size={16} />
                        Change photo
                    </button>
                )}

                {error && (
                    <p role="alert" className="text-sm text-danger">
                        {error}
                    </p>
                )}

                {changeAvatarMutation.isError && (
                    <p role="alert" className="text-sm text-danger">
                        Failed to upload photo. Please try again.
                    </p>
                )}
            </div>
        </div>
    )
}