import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { formatCents } from '@/lib/format-money'

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: quote } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!quote) {
        notFound()
    }

    const cartItems = quote.cart_data as any[]

    async function deleteQuote(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('quotes').delete().eq('id', id)
        revalidatePath('/admin/quotes')
    }

    async function updateStatus(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const status = formData.get('status') as string
        const supabase = await createClient()
        await supabase.from('quotes').update({ status }).eq('id', id)
        revalidatePath(`/admin/quotes/${id}`)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/quotes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Quote Details</h1>
                    <p className="text-muted-foreground mt-1">
                        Quote ID: {quote.id.slice(0, 8)}...
                    </p>
                </div>
                <div className="flex gap-2">
                    <form action={deleteQuote}>
                        <input type="hidden" name="id" value={quote.id} />
                        <Button variant="destructive" size="sm" type="submit">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p>{quote.customer_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{quote.customer_email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p>{quote.customer_phone || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                            <p>
                                {quote.event_date
                                    ? new Date(quote.event_date).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                            <p>{quote.event_type || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Venue</p>
                            <p className="whitespace-pre-line">{quote.venue_address || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quote Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Quote Items</CardTitle>
                    <CardDescription>Products included in this quote</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {cartItems?.map((item: any, index: number) => (
                            <div
                                key={index}
                                className="flex items-center justify-between border-b pb-4 last:border-0"
                            >
                                <div>
                                    <p className="font-medium">{item.name || 'Product'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Quantity: {item.quantity || 1}
                                    </p>
                                </div>
                                <p className="font-medium">
                                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCents(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{formatCents(quote.delivery_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Setup Fee</span>
                        <span>{formatCents(quote.setup_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCents(quote.total_amount)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateStatus} className="flex gap-4 items-center">
                        <input type="hidden" name="id" value={quote.id} />
                        <select
                            name="status"
                            defaultValue={quote.status}
                            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="accepted">Accepted</option>
                            <option value="expired">Expired</option>
                        </select>
                        <Button type="submit">Update Status</Button>
                    </form>
                    <p className="text-sm text-muted-foreground mt-2">
                        Created: {new Date(quote.created_at).toLocaleString()}
                    </p>
                    {quote.expires_at && (
                        <p className="text-sm text-muted-foreground">
                            Expires: {new Date(quote.expires_at).toLocaleString()}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
