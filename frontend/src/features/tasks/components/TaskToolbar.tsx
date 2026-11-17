
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { defaultTaskFilters, type TaskFilters } from "../types/taskFilters"
import FiltersMenu from "./FiltersMenu"
import TaskCreateModal from "./TaskCreateModal"

type TaskToolbarProps = {
    filters: TaskFilters,
    handleFiltersChange: Dispatch<SetStateAction<TaskFilters>>,
    isCreateBtnVisible: boolean,
    enableFilterByAssignedUser: boolean,
}

export default function TaskToolbar({
    filters,
    handleFiltersChange,
    isCreateBtnVisible = true,
    enableFilterByAssignedUser
}: TaskToolbarProps) {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
    const filterMenuRef = useRef<HTMLDivElement>(null)
    const filterButtonRef = useRef<HTMLButtonElement>(null)

    const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false)

    useEffect(() => {
        if (!isFilterMenuOpen) return

        function handleClickOutside(e: PointerEvent) {
            if (
                filterMenuRef.current &&
                e.target instanceof Node &&
                !filterMenuRef.current.contains(e.target)
            ) {
                setIsFilterMenuOpen(false)
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsFilterMenuOpen(false)
                filterButtonRef.current?.focus()
            }
        }

        document.addEventListener("pointerdown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isFilterMenuOpen])

    function countFilters(): number {
        const currFilters = Object.values(filters)
        const defaultFilters = Object.values(defaultTaskFilters)

        const diffCount = currFilters.filter((elem, idx) => {
            return elem !== defaultFilters[idx]
        })

        return diffCount.length
    }

    const activeFiltersCount = countFilters()

    return (
        <div className="mb-5 flex w-full justify-end gap-3">
            <div className="relative" ref={filterMenuRef}>
                <button
                    type="button"
                    ref={filterButtonRef}
                    onClick={() => setIsFilterMenuOpen(prev => !prev)}
                    aria-expanded={isFilterMenuOpen}
                    aria-controls={isFilterMenuOpen ? "task-filters-menu" : undefined}
                    className={`
                        flex cursor-pointer items-center gap-2
                        rounded-lg border border-border
                        bg-surface-muted px-4 py-2
                        text-text-secondary transition-colors
                        hover:bg-surface-hover hover:text-foreground
                        focus-visible:outline-none
                        focus-visible:ring-2 focus-visible:ring-primary/40
                        ${isFilterMenuOpen ? "bg-surface-hover" : ""}
                    `}
                >
                    Filter

                    {activeFiltersCount > 0 && (
                        <span
                            className="
                                flex h-5 min-w-5 items-center
                                justify-center rounded-full
                                bg-primary px-1
                                text-xs text-primary-foreground
                            "
                        >
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {isFilterMenuOpen && (
                    <FiltersMenu
                        filters={filters}
                        handleFiltersChange={handleFiltersChange}
                        onClose={() => setIsFilterMenuOpen(false)}
                        enableFilterByAssignedUser={enableFilterByAssignedUser}
                    />
                )}
            </div>

            {isCreateBtnVisible && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsTaskCreateModalOpen(true)}
                        className="
                            cursor-pointer rounded-lg
                            bg-primary px-4 py-2
                            text-primary-foreground
                            transition-colors
                            hover:bg-primary-hover
                            focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-primary/40
                        "
                    >
                        Add new task
                    </button>

                    {isTaskCreateModalOpen && (
                        <TaskCreateModal
                            onClose={() => setIsTaskCreateModalOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
