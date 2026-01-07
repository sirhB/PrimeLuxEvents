import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoryImagesPage({ params }: { params: { id: string } }) {
    const { id } = params
    const supabase = await createClient()

    // Fetch category
    const { data: category } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('id', id)
        .single()

    if (!category) {
        notFound()
    }

    // Fetch images
    const { data: images } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('category_id', id)
        .order('order_index')

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
                    <Button className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Images
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images?.map((image) => (
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
                                    <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white rounded-xl">
                                        <Plus className="h-5 w-5 rotate-45" /> {/* Use as close/delete icon if needed */}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="bg-red-500/80 hover:bg-red-500 text-white rounded-xl">
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

                {images?.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card rounded-3xl border-none">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <ImageIcon className="h-10 w-10" />
                            <p className="text-sm">No images in this collection yet</p>
                            <Button variant="outline" className="mt-4 border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                                <Plus className="mr-2 h-4 w-4" />
                                Add your first image
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
