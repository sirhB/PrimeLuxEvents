'use client'

import { Tag } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/stripe'
import { Card, CardContent } from '@/components/ui/card'
import { CreateDiscountDialog } from '@/components/admin/marketing/create-discount-dialog'
import { ToggleActiveSwitch } from '@/components/admin/marketing/toggle-active-switch'
import { DeleteDiscountButton } from '@/components/admin/marketing/delete-discount-button'
import { EditDiscountDialog } from '@/components/admin/marketing/edit-discount-dialog'
import { AdminPageHeader } from '@/components/admin/page-shell'

interface DiscountsContentProps {
    discounts: any[] | null
}

export function DiscountsContent({ discounts }: DiscountsContentProps) {
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                eyebrow="Marketing"
                title="Discounts"
                description="Manage automatic cart discounts based on spend tiers."
                actions={<CreateDiscountDialog />}
            />

            <Card className="border-none glass-card overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-black/20">
                            <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4 pl-6">Tier Name</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Threshold</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Discount</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-center">Status</TableHead>
                                <TableHead className="w-12 pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts?.map((discount) => (
                                <TableRow key={discount.id} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center text-[var(--dashboard-accent-gold)]">
                                                <Tag className="h-4 w-4" />
                                            </div>
                                            <span className="font-serif text-lg text-[var(--dashboard-text)]">{discount.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm text-[var(--dashboard-text)] font-medium">
                                            {formatCurrency(discount.min_cart_total)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-[var(--dashboard-accent-gold)]">
                                            {discount.discount_type === 'percentage'
                                                ? `${discount.discount_value}% OFF`
                                                : `${formatCurrency(discount.discount_value)} OFF`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <ToggleActiveSwitch id={discount.id} isActive={discount.is_active} />
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditDiscountDialog discount={discount} />
                                            <DeleteDiscountButton id={discount.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!discounts || discounts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-40 opacity-30">
                                        No discounts found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
