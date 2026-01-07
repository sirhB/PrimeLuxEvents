'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    multiple?: boolean
}

export function ImageUpload({ value, onChange, multiple = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const files = e.target.files
            if (!files || files.length === 0) return

            const uploadedUrls: string[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { data, error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file)

                if (uploadError) {
                    throw uploadError
                }

                if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(filePath)

                    uploadedUrls.push(publicUrl)
                }
            }

            if (multiple) {
                onChange([...value, ...uploadedUrls])
            } else {
                onChange([uploadedUrls[0]])
            }

            toast.success('Image(s) uploaded successfully')
        } catch (error: any) {
            toast.error('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const onRemove = (url: string) => {
        onChange(value.filter((current) => current !== url))
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-wrap gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-40 h-40 rounded-xl overflow-hidden border border-border group shadow-sm bg-muted/30">
                        <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}

                {(multiple || value.length === 0) && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all group"
                    >
                        {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-secondary group-hover:bg-gold/10 transition-colors">
                                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-gold" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-gold">
                                    {multiple ? 'Upload Images' : 'Upload Image'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                type="file"
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple={multiple}
                onChange={onUpload}
            />

            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                {multiple ? 'Recommended: High resolution 4:5 aspect ratio images.' : 'Recommended: Square or 4:3 aspect ratio image.'}
            </p>
        </div>
    )
}
