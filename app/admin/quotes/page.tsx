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

export default async function QuotesPage() {
    const supabase = await createClient()
    const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })

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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage customer quotes
                </p>
            </div>
            <div className="rounded-md border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                                <TableCell>${quote.total_amount}</TableCell>
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
            </div>
        </div>
    )
}
