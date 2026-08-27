'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

export function PartnerLogoUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be signed in to upload a logo')
        return
      }

      const ext = file.name.split('.').pop() || 'png'
      const filePath = `partner-logos/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file, {
        upsert: true,
      })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Logo uploaded')
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-flex rounded-xl border bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Brand logo" className="h-16 max-w-[220px] object-contain" />
          <button
            type="button"
            className="absolute -right-2 -top-2 rounded-full border bg-white p-1 shadow-sm"
            onClick={() => onChange('')}
            aria-label="Remove logo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          No logo yet
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload logo
        </Button>
      </div>
    </div>
  )
}
