'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Loader2, RotateCcw } from 'lucide-react'
import {
    refundSecurityDeposit,
    updatePickupSchedule,
} from '@/app/actions/security-deposit'
import { formatCents } from '@/lib/format-money'
import { toast } from 'sonner'

type OrderScheduleProps = {
    orderId: string
    fulfillmentMethod: string | null
    deliveryDate: string | null
    deliveryTime: string | null
    returnDate: string | null
    returnTime: string | null
    pickupDate: string | null
    pickupTime: string | null
    pickupConfirmed: boolean
    securityDepositAmount: number
    securityDepositStatus: string | null
}

export function OrderPickupDepositPanel({
    orderId,
    fulfillmentMethod,
    deliveryDate,
    deliveryTime,
    returnDate,
    returnTime,
    pickupDate,
    pickupTime,
    pickupConfirmed,
    securityDepositAmount,
    securityDepositStatus,
}: OrderScheduleProps) {
    const isCustomerPickup = fulfillmentMethod === 'customer_pickup'
    const [pending, startTransition] = useTransition()
    const [refundPending, startRefund] = useTransition()

    const [pickupDateVal, setPickupDateVal] = useState(deliveryDate || '')
    const [pickupTimeVal, setPickupTimeVal] = useState(deliveryTime || '')
    const [returnDateVal, setReturnDateVal] = useState(returnDate || '')
    const [returnTimeVal, setReturnTimeVal] = useState(returnTime || '')
    const [vendorPickupDate, setVendorPickupDate] = useState(pickupDate || '')
    const [vendorPickupTime, setVendorPickupTime] = useState(pickupTime || '')

    const saveSchedule = (confirm: boolean) => {
        startTransition(async () => {
            const result = await updatePickupSchedule(orderId, {
                fulfillmentMethod: isCustomerPickup ? 'customer_pickup' : 'delivery',
                pickupDate: pickupDateVal || undefined,
                pickupTime: pickupTimeVal || undefined,
                returnDate: returnDateVal || undefined,
                returnTime: returnTimeVal || undefined,
                vendorPickupDate: vendorPickupDate || undefined,
                vendorPickupTime: vendorPickupTime || undefined,
                confirm,
            })
            if (result.success) {
                toast.success(confirm ? 'Schedule confirmed' : 'Schedule updated')
            } else {
                toast.error(result.error || 'Failed to update schedule')
            }
        })
    }

    const handleRefund = () => {
        if (!confirm('Refund the full security deposit to the customer?')) return
        startRefund(async () => {
            const result = await refundSecurityDeposit(orderId)
            if (result.success) {
                toast.success(`Refunded ${formatCents(result.amount || 0)}`)
            } else {
                toast.error(result.error || 'Refund failed')
            }
        })
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[var(--dashboard-text)] text-base font-semibold mb-1">
                    {isCustomerPickup ? 'Customer pickup & return' : 'Delivery & pickup schedule'}
                </h3>
                <p className="text-sm text-[var(--dashboard-text-muted)] mb-4">
                    Confirm or change the customer&apos;s requested times.
                    {pickupConfirmed ? (
                        <span className="ml-2 text-[var(--dashboard-accent-green)] font-medium">Confirmed</span>
                    ) : (
                        <span className="ml-2 text-amber-500 font-medium">Awaiting confirmation</span>
                    )}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                            {isCustomerPickup ? 'Warehouse pickup date' : 'Delivery date'}
                        </Label>
                        <Input
                            type="date"
                            value={pickupDateVal}
                            onChange={(e) => setPickupDateVal(e.target.value)}
                            className="bg-black/20 border-none rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                            {isCustomerPickup ? 'Warehouse pickup time' : 'Delivery time'}
                        </Label>
                        <Input
                            type="time"
                            value={pickupTimeVal}
                            onChange={(e) => setPickupTimeVal(e.target.value)}
                            className="bg-black/20 border-none rounded-xl"
                        />
                    </div>

                    {isCustomerPickup ? (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                                    Return date
                                </Label>
                                <Input
                                    type="date"
                                    value={returnDateVal}
                                    onChange={(e) => setReturnDateVal(e.target.value)}
                                    className="bg-black/20 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                                    Return time
                                </Label>
                                <Input
                                    type="time"
                                    value={returnTimeVal}
                                    onChange={(e) => setReturnTimeVal(e.target.value)}
                                    className="bg-black/20 border-none rounded-xl"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                                    Vendor pickup date
                                </Label>
                                <Input
                                    type="date"
                                    value={vendorPickupDate}
                                    onChange={(e) => setVendorPickupDate(e.target.value)}
                                    className="bg-black/20 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">
                                    Vendor pickup time
                                </Label>
                                <Input
                                    type="time"
                                    value={vendorPickupTime}
                                    onChange={(e) => setVendorPickupTime(e.target.value)}
                                    className="bg-black/20 border-none rounded-xl"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={() => saveSchedule(false)}
                        className="rounded-md"
                    >
                        {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save changes
                    </Button>
                    <Button
                        type="button"
                        disabled={pending}
                        onClick={() => saveSchedule(true)}
                        className="rounded-md bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90"
                    >
                        {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Check className="h-4 w-4 mr-2" />
                        )}
                        Confirm schedule
                    </Button>
                </div>
            </div>

            {securityDepositAmount > 0 && (
                <div className="pt-6 border-t border-[var(--dashboard-border)]">
                    <h3 className="text-[var(--dashboard-text)] text-base font-semibold mb-1">
                        Security deposit
                    </h3>
                    <p className="text-sm text-[var(--dashboard-text-muted)] mb-3">
                        Separate Stripe charge — refund without touching the rental payment.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <p className="text-lg font-serif text-[var(--dashboard-accent-gold)]">
                                {formatCents(securityDepositAmount)}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-[var(--dashboard-text-muted)] capitalize">
                                Status: {securityDepositStatus || 'none'}
                            </p>
                        </div>
                        {(securityDepositStatus === 'held' ||
                            securityDepositStatus === 'partially_refunded') && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={refundPending}
                                onClick={handleRefund}
                                className="rounded-md"
                            >
                                {refundPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                Refund deposit
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
