'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { PortfolioImageUploadDialog } from '@/components/admin/portfolio-image-upload-dialog'
import { deletePortfolioImage } from '../actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface PortfolioImage {
    id: string
    category_id: string
    image_url: string
    title: string | null
    description: string | null
    order_index: number
    created_at: string
}

interface PortfolioCategory {
    id: string
    name: string
    slug: string
    description: string | null
    cover_image: string | null
    created_at: string
    updated_at: string
}

interface CategoryImagesClientProps {
    category: PortfolioCategory
    images: PortfolioImage[]
}

export function CategoryImagesClient({ category, images }: CategoryImagesClientProps) {
    const router = useRouter()
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [imageToDelete, setImageToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDeleteClick = (imageId: string) => {
        setImageToDelete(imageId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!imageToDelete) return

        setDeleting(true)
        try {
            const result = await deletePortfolioImage(imageToDelete, category.id)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Image deleted successfully')
                router.refresh()
            }
        } catch (error: any) {
            toast.error('Error deleting image: ' + error.message)
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
            setImageToDelete(null)
        }
    }

    return (
        <>
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
                                            onClick={() => handleDeleteClick(image.id)}
                                            className="bg-red-500/80 hover:bg-red-500 text-white rounded-xl"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-2">
                                    <h3 className="font-serif text-lg text-[var(--dashboard-text)] truncate">
                                        {image.title || 'Untitled'}
                                    </h3>
                                    <p className="text-[var(--dashboard-text-muted)] text-sm font-light truncate">
                                        {image.description || 'No description'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card rounded-3xl border-none">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                                <ImageIcon className="h-10 w-10" />
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
            </div>

            <PortfolioImageUploadDialog
                categoryId={category.id}
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[var(--dashboard-text)]">
                            Delete Portfolio Image
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[var(--dashboard-text-muted)]">
                            Are you sure you want to delete this image? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                            className="border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
