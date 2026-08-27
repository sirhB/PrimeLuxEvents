'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminQRCode } from '@/components/admin/qr-code'
import { ArrowLeft, Loader2, MapPin, Printer } from 'lucide-react'
import Link from 'next/link'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default function WarehouseLocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [location, setLocation] = useState<{ id: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('warehouse_locations')
        .select('*')
        .eq('id', id)
        .single()
      setLocation(data)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const printTag = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (!location) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-[var(--dashboard-text-muted)]">Location not found</p>
        <Button asChild variant="outline">
          <Link href="/admin/warehouse/locations">Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Locations', href: '/admin/warehouse/locations' }, { label: location.name }]}
        eyebrow="Warehouse"
        title={location.name}
        description={location.type}
        actions={
          <Button variant="ghost" size="icon" className="rounded-md print:hidden" onClick={() => router.push('/admin/warehouse/locations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
      />

      <Card className="mx-auto w-full max-w-md border-none glass-card print:shadow-none print:border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 rounded-xl bg-[var(--dashboard-accent-gold)]/10 p-3 text-[var(--dashboard-accent-gold)] w-fit">
            <MapPin className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold">{location.name}</CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">{location.type}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          <AdminQRCode url={`/admin/warehouse/locations/${location.id}`} label={location.name} />
          <p className="text-xs text-[var(--dashboard-text-muted)] font-mono">{location.id}</p>
          <Button onClick={printTag} className="w-full rounded-xl print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print Tag
          </Button>
        </CardContent>
      </Card>
    </AdminPage>
  )
}
