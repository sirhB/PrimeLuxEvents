import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Eye, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { formatCents } from '@/lib/format-money'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'

export default async function QuotesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('quotes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: quotes, count } = await query.range(start, end)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800'
            case 'sent':
                return 'bg-blue-100 text-blue-800'
            case 'accepted':
                return 'bg-green-100 text-green-800'
            case 'expired':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage customer quotes
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search quotes..." />
                <StatusFilter
                    statuses={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'accepted', label: 'Accepted' },
                        { value: 'expired', label: 'Expired' },
                    ]}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quote ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Event Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotes?.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium font-mono text-xs">
                                        {quote.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{quote.customer_name || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {quote.customer_email || 'No email'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {quote.event_date
                                            ? new Date(quote.event_date).toLocaleDateString()
                                            : 'Not set'}
                                    </TableCell>
                                    <TableCell>{formatCents(quote.total_amount)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                                                getStatusColor(quote.status)
                                            )}
                                        >
                                            {quote.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(quote.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/quotes/${quote.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {quotes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No quotes found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {count !== null && count > 0 && (
                <PaginationControls
                    hasNextPage={end < count}
                    hasPrevPage={start > 0}
                    totalCount={count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}
