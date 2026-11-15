import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react"

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>

export default function PasswordInput({ className="", ...props }: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative">
            <input
                {...props}
                type={isVisible ? "text" : "password"}
                className={`${className} pr-11`}
            />

            <button
                type="button"
                onClick={() => setIsVisible(prev => !prev)}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                className="
                    absolute inset-y-0 right-0 flex w-11
                    cursor-pointer items-center justify-center
                    text-gray-400 hover:text-gray-600
                "
            >
                {isVisible
                    ? <EyeOff size={19} />
                    : <Eye size={19} />
                }
            </button>
        </div>
    )
}