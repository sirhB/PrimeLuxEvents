import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, FileText, DollarSign, AlertTriangle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/format-money'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch real data
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .order('created_at', { ascending: false })

    const { data: quotes } = await supabase
        .from('quotes')
        .select('status')

    const { data: products } = await supabase
        .from('products')
        .select('quantity_available, quantity_reserved')

    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    const { data: upcomingReservations } = await supabase
        .from('rental_reservations')
        .select('*, products(name)')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(5)

    // Calculate metrics
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const orderCount = orders?.length || 0
    const pendingQuotes = quotes?.filter((q) => q.status === 'draft' || q.status === 'sent').length || 0
    const lowStockProducts =
        products?.filter((p) => p.quantity_available - p.quantity_reserved <= 2).length || 0

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Overview of your business metrics and performance
                </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCents(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingQuotes}</div>
                        <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">Products need attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders and Upcoming Reservations */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/orders">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders?.map((order) => (
                                <div key={order.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{order.customer_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="font-medium">{formatCents(order.total_amount)}</div>
                                </div>
                            ))}
                            {recentOrders?.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No orders yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Upcoming Reservations</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/inventory">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingReservations?.map((reservation) => (
                                <div key={reservation.id} className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {reservation.products?.name || 'Unknown Product'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(reservation.start_date).toLocaleDateString()} -{' '}
                                            {new Date(reservation.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Qty: {reservation.quantity}
                                    </div>
                                </div>
                            ))}
                            {upcomingReservations?.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No upcoming reservations
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href="/admin/products/new">Add Product</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/orders">View Orders</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/quotes">View Quotes</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/inventory">Check Inventory</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
