'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { PortfolioImageUpload } from './portfolio-image-upload'
import { createPortfolioCategory, updatePortfolioCategory } from '@/app/admin/portfolio/actions'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PortfolioCategoryFormProps {
    category?: any
}

export function PortfolioCategoryForm({ category }: PortfolioCategoryFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [coverImage, setCoverImage] = useState(category?.cover_image ? [category.cover_image] : [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            slug: (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-'),
            description: formData.get('description') as string,
            cover_image: coverImage[0] || null,
        }

        try {
            if (category) {
                const result = await updatePortfolioCategory(category.id, data)
                if (result.error) throw new Error(result.error)
                toast.success('Portfolio category updated')
            } else {
                const result = await createPortfolioCategory(data)
                if (result.error) throw new Error(result.error)
                toast.success('Portfolio category created')
            }
            router.push('/admin/portfolio')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                    <Link href="/admin/portfolio">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-serif text-[var(--dashboard-text)]">
                        {category ? 'Edit Portfolio Category' : 'New Portfolio Category'}
                    </h2>
                    <p className="text-sm text-[var(--dashboard-text-muted)] font-light">
                        {category ? 'Update category details and cover image' : 'Create a new category for your portfolio showcases'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="glass-card border-none overflow-hidden rounded-3xl">
                        <CardHeader className="border-b border-[var(--dashboard-border)]/50 bg-white/5 pb-6">
                            <CardTitle className="text-lg font-serif font-light text-[var(--dashboard-text)]">General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Category Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={category?.name}
                                        placeholder="e.g. Weddings"
                                        className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] transition-all rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        defaultValue={category?.slug}
                                        placeholder="weddings"
                                        className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] transition-all rounded-xl h-12 font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={category?.description}
                                    placeholder="Brief description of this portfolio category..."
                                    className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] transition-all rounded-2xl min-h-[120px] resize-none py-4"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="glass-card border-none overflow-hidden rounded-3xl">
                        <CardHeader className="border-b border-[var(--dashboard-border)]/50 bg-white/5 pb-6">
                            <CardTitle className="text-lg font-serif font-light text-[var(--dashboard-text)]">Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <PortfolioImageUpload
                                value={coverImage}
                                onChange={(urls) => setCoverImage(urls)}
                                multiple={false}
                                bucket="portfolio"
                            />
                            <p className="mt-4 text-[10px] text-[var(--dashboard-text-muted)] font-light leading-relaxed">
                                This image will be used as the thumbnail for this category throughout the site.
                                Recommended aspect ratio: 4:3.
                            </p>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold text-base shadow-lg shadow-[var(--dashboard-accent-gold)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-5 w-5" />
                                {category ? 'Update Category' : 'Create Category'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}
