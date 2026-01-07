'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { UploadPortfolioImagesDialog } from '@/components/admin/upload-portfolio-images-dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PortfolioImage {
    id: string
    image_url: string
    title: string
    description: string
}

interface PortfolioCategory {
    id: string
    name: string
    description: string
}

interface CategoryImagesClientProps {
    category: PortfolioCategory
    initialImages: PortfolioImage[]
}

export function CategoryImagesClient({ category, initialImages }: CategoryImagesClientProps) {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [images, setImages] = useState(initialImages)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async (imageId: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return

        setDeletingId(imageId)
        const supabase = createClient()

        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/portfolio/')
            if (urlParts.length > 1) {
                const filePath = urlParts[1]

                // Delete from storage
                await supabase.storage.from('portfolio').remove([filePath])
            }

            // Delete from database
            await supabase.from('portfolio_images').delete().eq('id', imageId)

            // Update local state
            setImages(images.filter(img => img.id !== imageId))
            router.refresh()
        } catch (error) {
            console.error('Error deleting image:', error)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href="/admin/portfolio"
                        className="flex items-center gap-2 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Portfolio
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                            {category.name}
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Manage the visual story of this collection.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setUploadDialogOpen(true)}
                        className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Images
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image) => (
                    <Card key={image.id} className="glass-card border-none overflow-hidden rounded-3xl group shadow-xl transition-all hover:translate-y-[-4px]">
                        <CardContent className="p-0 relative">
                            <div className="relative aspect-square">
                                <Image
                                    src={image.image_url}
                                    alt={image.title || 'Portfolio Image'}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(image.id, image.image_url)}
                                        disabled={deletingId === image.id}
                                        className="bg-red-500/80 hover:bg-red-500 text-white rounded-xl"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 space-y-2">
                                <h3 className="font-serif text-lg text-[var(--dashboard-text)] truncate">{image.title || 'Untitled'}</h3>
                                <p className="text-[var(--dashboard-text-muted)] text-sm font-light truncate">{image.description || 'No description'}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {images.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card rounded-3xl border-none">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <Plus className="h-10 w-10" />
                            <p className="text-sm">No images in this collection yet</p>
                            <Button
                                variant="outline"
                                onClick={() => setUploadDialogOpen(true)}
                                className="mt-4 border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add your first image
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <UploadPortfolioImagesDialog
                categoryId={category.id}
                categoryName={category.name}
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
            />
        </div>
    )
}
