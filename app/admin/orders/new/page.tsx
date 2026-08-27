import { OrderForm } from '@/components/admin/orders/OrderForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default function NewOrderPage() {
    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Orders', href: '/admin/orders' }, { label: 'New' }]}
                title="Create New Order"
                description="Draft a new order for a client, set logistics, and choose payment options."
                actions={
                    <Button asChild variant="outline" size="sm" className="rounded-md">
                        <Link href="/admin/orders">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Orders
                        </Link>
                    </Button>
                }
            />

            <OrderForm />
        </AdminPage>
    )
}
