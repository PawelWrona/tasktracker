import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
    theme: Theme,
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
    const saved = localStorage.getItem("theme")

    if (saved === "light" || saved === "dark") {
        return saved
    }

    return "system"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)")

        function applyTheme() {
            const isDark = theme === "dark" || (theme === "system" && media.matches)

            document.documentElement.classList.toggle("dark", isDark)
        }

        applyTheme()

        media.addEventListener("change", applyTheme)

        return () => media.removeEventListener("change", applyTheme)
    }, [theme])

    function setTheme(newTheme: Theme) {
        setThemeState(newTheme)

        if (newTheme === "system") {
            localStorage.removeItem("theme")
        } else {
            localStorage.setItem("theme", newTheme)
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)

    if (!context) throw new Error("useTheme must be used within ThemeProvider")

    return context
}