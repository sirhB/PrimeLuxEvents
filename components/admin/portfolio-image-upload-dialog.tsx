'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PortfolioImageUpload } from './portfolio-image-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PortfolioImageUploadDialogProps {
    categoryId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PortfolioImageUploadDialog({
    categoryId,
    open,
    onOpenChange,
}: PortfolioImageUploadDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (images.length === 0) {
            toast.error('Please upload at least one image')
            return
        }

        setLoading(true)

        try {
            // Get the current max order_index for this category
            const { data: existingImages } = await supabase
                .from('portfolio_images')
                .select('order_index')
                .eq('category_id', categoryId)
                .order('order_index', { ascending: false })
                .limit(1)

            const startIndex = existingImages?.[0]?.order_index ?? -1

            // Insert all images with incremental order_index
            const imagesToInsert = images.map((imageUrl, index) => ({
                category_id: categoryId,
                image_url: imageUrl,
                title: images.length === 1 ? title : `${title} ${index + 1}`,
                description: description || null,
                order_index: startIndex + index + 1,
            }))

            const { error } = await supabase
                .from('portfolio_images')
                .insert(imagesToInsert)

            if (error) throw error

            toast.success(`${images.length} image(s) added successfully`)

            // Reset form
            setImages([])
            setTitle('')
            setDescription('')
            onOpenChange(false)

            // Refresh the page
            router.refresh()
        } catch (error: any) {
            toast.error('Error adding images: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[var(--dashboard-card)] border-[var(--dashboard-border)]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-[var(--dashboard-text)]">
                        Upload Portfolio Images
                    </DialogTitle>
                    <DialogDescription className="text-[var(--dashboard-text-muted)]">
                        Add new images to this portfolio category. You can upload multiple images at once.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="images" className="text-[var(--dashboard-text)] font-medium">
                                Images *
                            </Label>
                            <PortfolioImageUpload
                                value={images}
                                onChange={setImages}
                                multiple={true}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[var(--dashboard-text)] font-medium">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Summer Wedding Reception"
                                className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                            />
                            <p className="text-xs text-[var(--dashboard-text-muted)]">
                                If uploading multiple images, numbers will be appended automatically
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[var(--dashboard-text)] font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description for these images..."
                                rows={3}
                                className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || images.length === 0}
                            className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                `Upload ${images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''}` : 'Images'}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
