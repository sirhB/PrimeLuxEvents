"use client"

import { format } from "date-fns"

interface OrderItem {
    id: string
    quantity: number
    price_at_time: number
    products?: {
        name: string
    }
}

interface Order {
    id: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    total_amount: number
    subtotal?: number
    tax_rate?: number
    tax_amount?: number
    delivery_fee?: number
    setup_fee?: number
    discount_amount?: number
    status: string
    delivery_address?: string
    delivery_time?: string
    delivery_date?: string
    delivery_notes?: string
    notes?: string
    created_at: string
    order_items: OrderItem[]
}

interface OrderInvoiceProps {
    order: Order
}

export function OrderInvoice({ order }: OrderInvoiceProps) {
    // Helper function to convert cents to dollar display
    const formatCents = (cents: number | null | undefined): string => {
        if (cents === null || cents === undefined) return '$0.00'
        return `$${(cents / 100).toFixed(2)}`
    }

    // Calculate subtotal from order items if not provided (in cents)
    const calculatedSubtotal = order.subtotal ||
        order.order_items.reduce((sum, item) => sum + (item.quantity * item.price_at_time), 0)

    const deliveryFee = order.delivery_fee || 0
    const setupFee = order.setup_fee || 0
    const discountAmount = order.discount_amount || 0
    const taxAmount = order.tax_amount || 0

    // Invoice number based on order ID
    const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`
    const invoiceDate = format(new Date(order.created_at), 'MMMM d, yyyy')

    return (
        <div className="hidden print:block max-w-4xl mx-auto bg-white text-black p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-black">
                <div>
                    <h1 className="text-4xl font-serif font-bold mb-2">PrimeLux Events</h1>
                    <p className="text-sm text-gray-600">Premium Event Rentals</p>
                    <div className="mt-4 text-sm">
                        <p>123 Luxury Lane</p>
                        <p>New York, NY 10001</p>
                        <p>Phone: (555) 000-0000</p>
                        <p>Email: info@primeluxevents.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold mb-4">INVOICE</h2>
                    <div className="text-sm space-y-1">
                        <p><span className="font-semibold">Invoice #:</span> {invoiceNumber}</p>
                        <p><span className="font-semibold">Date:</span> {invoiceDate}</p>
                        <p><span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span></p>
                    </div>
                </div>
            </div>

            {/* Bill To & Delivery Info */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="text-sm font-bold uppercase mb-3 text-gray-600">Bill To</h3>
                    <div className="text-sm">
                        <p className="font-semibold text-base mb-1">{order.customer_name}</p>
                        <p>{order.customer_email}</p>
                        {order.customer_phone && <p>{order.customer_phone}</p>}
                    </div>
                </div>
                {order.delivery_address && (
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-3 text-gray-600">Delivery Information</h3>
                        <div className="text-sm">
                            <p className="mb-1">{order.delivery_address}</p>
                            {order.delivery_date && (
                                <p className="font-semibold">
                                    {format(new Date(order.delivery_date), 'MMMM d, yyyy')}
                                    {order.delivery_time && ` at ${order.delivery_time}`}
                                </p>
                            )}
                            {order.delivery_notes && (
                                <p className="mt-2 text-gray-600 italic">{order.delivery_notes}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-3 font-semibold text-sm uppercase">Item</th>
                            <th className="text-center py-3 font-semibold text-sm uppercase w-24">Qty</th>
                            <th className="text-right py-3 font-semibold text-sm uppercase w-32">Unit Price</th>
                            <th className="text-right py-3 font-semibold text-sm uppercase w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.order_items.map((item) => {
                            const lineTotal = item.quantity * item.price_at_time
                            return (
                                <tr key={item.id} className="border-b border-gray-300">
                                    <td className="py-4 text-sm">
                                        {item.products?.name || 'Unknown Product'}
                                    </td>
                                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                                    <td className="py-4 text-right text-sm font-mono">
                                        {formatCents(item.price_at_time)}
                                    </td>
                                    <td className="py-4 text-right text-sm font-mono font-semibold">
                                        {formatCents(lineTotal)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-12">
                <div className="w-80">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-mono">{formatCents(calculatedSubtotal)}</span>
                        </div>

                        {deliveryFee > 0 && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Delivery Fee:</span>
                                <span className="font-mono">{formatCents(deliveryFee)}</span>
                            </div>
                        )}

                        {setupFee > 0 && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Setup Fee:</span>
                                <span className="font-mono">{formatCents(setupFee)}</span>
                            </div>
                        )}

                        {discountAmount > 0 && (
                            <div className="flex justify-between py-2 text-green-700">
                                <span>Discount:</span>
                                <span className="font-mono">-{formatCents(discountAmount)}</span>
                            </div>
                        )}

                        {taxAmount > 0 && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">
                                    Tax {order.tax_rate ? `(${(order.tax_rate * 100).toFixed(3)}%)` : ''}:
                                </span>
                                <span className="font-mono">{formatCents(taxAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-4 border-t-2 border-black text-lg font-bold">
                            <span>Total:</span>
                            <span className="font-mono">{formatCents(order.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-300">
                    <h3 className="text-sm font-bold uppercase mb-2 text-gray-600">Notes</h3>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-8 mt-12">
                <div className="text-center text-sm text-gray-600">
                    <p className="mb-2 font-semibold">Thank you for your business!</p>
                    <p>Payment is due within 30 days of invoice date.</p>
                    <p className="mt-4">For questions about this invoice, please contact us at billing@primeluxevents.com</p>
                </div>
            </div>
        </div>
    )
}
