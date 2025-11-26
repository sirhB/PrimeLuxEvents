import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[var(--dashboard-accent-gold)] text-black shadow hover:bg-[var(--dashboard-accent-gold)]/80",
                secondary:
                    "border-transparent bg-[var(--dashboard-card)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                outline: "text-[var(--dashboard-text)] border-[var(--dashboard-border)]",
                success: "border-transparent bg-green-500/10 text-green-500 border-green-500/20",
                warning: "border-transparent bg-orange-500/10 text-orange-500 border-orange-500/20",
                info: "border-transparent bg-blue-500/10 text-blue-500 border-blue-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
