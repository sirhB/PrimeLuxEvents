import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
                secondary:
                    "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                outline: "text-foreground border-border",
                success: "border-[var(--dashboard-accent-green)]/20 bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]",
                warning: "border-[var(--dashboard-accent-orange)]/20 bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)]",
                info: "border-[var(--dashboard-accent-blue)]/20 bg-[var(--dashboard-accent-blue)]/10 text-[var(--dashboard-accent-blue)]",
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
