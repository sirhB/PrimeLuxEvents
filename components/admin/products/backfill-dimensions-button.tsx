'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backfillProductDimensions } from '@/app/admin/products/backfill-dimensions'

export function BackfillDimensionsButton() {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const result = await backfillProductDimensions()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(
        `Updated ${result.updated} of ${result.scanned} products with dimensions`,
      )
    } catch (e: any) {
      toast.error(e?.message || 'Backfill failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={run}
      disabled={loading}
      className="gap-2"
    >
      <Ruler className="h-4 w-4" />
      {loading ? 'Extracting…' : 'Extract dimensions'}
    </Button>
  )
}
