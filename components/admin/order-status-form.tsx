"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface OrderStatusFormProps {
    orderId: string
    currentStatus: string
    updateStatusAction: (formData: FormData) => Promise<void>
}

export function OrderStatusForm({ orderId, currentStatus, updateStatusAction }: OrderStatusFormProps) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updateStatusAction(formData)
            toast.success("Order status updated successfully")
        } catch (error) {
            toast.error("Failed to update order status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="flex gap-4">
            <Select name="status" defaultValue={currentStatus}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Status"}
            </Button>
        </form>
    )
}
