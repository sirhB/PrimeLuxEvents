'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateQRCode } from '@/lib/qr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, MapPin, Printer, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminQRCode } from '@/components/admin/qr-code'
import { CreateLocationDialog } from '@/components/admin/warehouse/create-location-dialog'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

interface Location {
    id: string
    name: string
    type: string
}

export default function WarehouseLocationsPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchLocations()
    }, [])

    async function fetchLocations() {
        setLoading(true)
        const { data, error } = await supabase
            .from('warehouse_locations')
            .select('*')
            .order('name')

        if (data) setLocations(data)
        setLoading(false)
    }

    async function deleteLocation(id: string) {
        const { error } = await supabase
            .from('warehouse_locations')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete location')
        } else {
            toast.success('Location deleted')
            fetchLocations()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
        )
    }

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Warehouse"
                title="Locations"
                description="Manage shelves, bins, and aisles. Generate QR tags for physical mapping."
                actions={<CreateLocationDialog onSuccess={fetchLocations} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                    <Card key={loc.id} className="border-none glass-card overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-black/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">{loc.name}</CardTitle>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">{loc.type}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteLocation(loc.id)}
                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 flex flex-col items-center gap-6">
                            <AdminQRCode url={`/admin/warehouse/locations/${loc.id}`} label={loc.name} />
                            <Button
                                variant="outline"
                                className="w-full rounded-xl border-[var(--dashboard-border)] hover:bg-[var(--dashboard-accent-gold)] hover:text-black"
                                onClick={() => window.open(`/admin/warehouse/locations/${loc.id}`, '_blank')}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Tag
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminPage>
    )
}
