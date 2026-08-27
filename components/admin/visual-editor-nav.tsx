"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeft, Eye, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VISUAL_EDITOR_PAGES, getPublicPath } from "@/lib/admin/visual-editor-config"
import { SaveStatus } from "@/components/admin/visual-editor/save-status"

interface VisualEditorNavProps {
    activePage: string
    onPageChange: (page: string) => void
    onNavigateToLanding: () => void
}

export function VisualEditorNav({ activePage, onPageChange, onNavigateToLanding }: VisualEditorNavProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const currentPage = VISUAL_EDITOR_PAGES.find((p) => p.id === activePage)

    return (
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-glass-bg)] px-4 backdrop-blur-md md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onNavigateToLanding}
                    className="h-8 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">Pages</span>
                </Button>

                <div className="hidden h-5 w-px bg-[var(--dashboard-border)] sm:block" aria-hidden />

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--dashboard-text-muted)]">
                        Editing
                    </p>
                    <h1 className="truncate text-sm font-semibold text-[var(--dashboard-text)]">
                        {currentPage?.label ?? activePage}
                    </h1>
                </div>
            </div>

            {/* Desktop page switcher */}
            <div className="hidden items-center rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-0.5 lg:flex">
                {VISUAL_EDITOR_PAGES.map((page) => {
                    const Icon = page.icon
                    const isActive = activePage === page.id
                    return (
                        <Button
                            key={page.id}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(page.id)}
                            className={cn(
                                "h-8 rounded-[calc(var(--dashboard-radius)-2px)] px-3 text-xs transition-colors",
                                isActive
                                    ? "bg-[var(--dashboard-card-hover)] text-[var(--dashboard-accent-gold)]"
                                    : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]",
                            )}
                        >
                            <Icon className="mr-1.5 h-3.5 w-3.5" />
                            {page.label}
                        </Button>
                    )
                })}
            </div>

            {/* Mobile page switcher */}
            <div className="lg:hidden">
                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 border-[var(--dashboard-border)] text-xs"
                        >
                            Switch page
                            <ChevronDown className="ml-1 h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                        {VISUAL_EDITOR_PAGES.map((page) => {
                            const Icon = page.icon
                            return (
                                <DropdownMenuItem
                                    key={page.id}
                                    onClick={() => {
                                        onPageChange(page.id)
                                        setMobileMenuOpen(false)
                                    }}
                                    className={cn(
                                        activePage === page.id && "text-[var(--dashboard-accent-gold)]",
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {page.label}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <SaveStatus activePage={activePage} />

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-[var(--dashboard-border)] text-xs text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                    asChild
                >
                    <Link href={getPublicPath(activePage)} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-1.5 h-4 w-4" />
                        <span className="hidden sm:inline">Preview</span>
                    </Link>
                </Button>
            </div>
        </header>
    )
}
