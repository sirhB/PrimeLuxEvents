'use client'

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl bg-white">
        <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn(
            "bg-gray-50/50 border-b border-gray-100",
            className
        )}
        {...props}
    />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-gray-50/30 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement> & {
        animate?: boolean
    }
>(({ className, animate = false, ...props }, ref) => {
    const { animate: _, ...restProps } = props as any

    if (!animate) {
        return (
            <tr
                ref={ref}
                className={cn(
                    "border-b border-gray-100 transition-all duration-150",
                    "hover:bg-gray-50/50",
                    "data-[state=selected]:bg-blue-50/30",
                    className
                )}
                {...restProps}
            />
        )
    }

    return (
        <motion.tr
            ref={ref}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "border-b border-gray-100 transition-all duration-150",
                "hover:bg-gray-50/50",
                "data-[state=selected]:bg-blue-50/30",
                className
            )}
            {...restProps}
        />
    )
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement> & {
        sortable?: boolean
    }
>(({ className, sortable = false, children, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-14 px-6 text-left align-middle font-medium text-gray-600 text-xs uppercase tracking-wide",
            "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            sortable && "cursor-pointer select-none hover:text-gray-900",
            className
        )}
        {...props}
    >
        {children}
    </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "px-6 py-4 align-middle text-gray-900",
            "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            className
        )}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-gray-500", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
