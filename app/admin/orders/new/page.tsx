import { OrderForm } from '@/components/admin/orders/OrderForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewOrderPage() {
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 min-h-screen bg-[var(--dashboard-background)]">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-[var(--dashboard-accent-gold)]">
                            <Link href="/admin/orders">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back to Orders
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-[var(--dashboard-text)]">
                        Create <span className="italic text-[var(--dashboard-accent-gold)]">New Order</span>
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] mt-2 font-serif italic text-lg">
                        Draft a new order for a client, set logistics, and choose payment options.
                    </p>
                </div>
            </div>

            <OrderForm />
        </div>
    )
}
