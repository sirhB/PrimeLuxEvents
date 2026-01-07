'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadPortfolioImagesDialogProps {
    categoryId: string
    categoryName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UploadPortfolioImagesDialog({
    categoryId,
    categoryName,
    open,
    onOpenChange,
}: UploadPortfolioImagesDialogProps) {
    const [files, setFiles] = useState<FileList | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleUpload = async () => {
        if (!files || files.length === 0) return

        setUploading(true)
        const supabase = createClient()

        try {
            // Get the current max order_index
            const { data: existingImages } = await supabase
                .from('portfolio_images')
                .select('order_index')
                .eq('category_id', categoryId)
                .order('order_index', { ascending: false })
                .limit(1)

            let currentOrderIndex = existingImages?.[0]?.order_index ?? -1

            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${categoryId}/${Date.now()}-${i}.${fileExt}`

                // Upload to storage
                const { error: uploadError, data } = await supabase.storage
                    .from('portfolio')
                    .upload(fileName, file)

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    continue
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('portfolio')
                    .getPublicUrl(fileName)

                // Insert into database
                await supabase.from('portfolio_images').insert({
                    category_id: categoryId,
                    image_url: publicUrl,
                    title: files.length === 1 ? title : `${title} ${i + 1}`,
                    description: files.length === 1 ? description : description,
                    order_index: ++currentOrderIndex,
                })
            }

            // Reset form
            setFiles(null)
            setTitle('')
            setDescription('')
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            console.error('Error uploading images:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass-card border-[var(--dashboard-border)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--dashboard-text)] font-serif text-2xl">
                        Upload Images
                    </DialogTitle>
                    <DialogDescription className="text-[var(--dashboard-text-muted)]">
                        Add new images to the {categoryName} collection
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="images" className="text-[var(--dashboard-text)]">
                            Images
                        </Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setFiles(e.target.files)}
                                className="glass-card border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                            />
                            {files && (
                                <span className="text-sm text-[var(--dashboard-text-muted)]">
                                    {files.length} file{files.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-[var(--dashboard-text)]">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Summer Wedding Reception"
                            className="glass-card border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[var(--dashboard-text)]">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this image or collection..."
                            className="glass-card border-[var(--dashboard-border)] text-[var(--dashboard-text)] min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!files || files.length === 0 || uploading}
                        className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload {files && files.length > 1 ? `${files.length} Images` : 'Image'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
