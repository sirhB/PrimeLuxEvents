'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

interface CategoryFormProps {
    category?: any
}

export function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(category?.image_url ? [category.image_url] : [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            description: formData.get('description') as string,
            image_url: imageUrl[0] || null,
            is_featured: formData.get('is_featured') === 'on',
        }

        try {
            if (category) {
                const { error } = await supabase
                    .from('categories')
                    .update(data)
                    .eq('id', category.id)
                if (error) throw error
                toast.success('Category updated')
            } else {
                const { error } = await supabase.from('categories').insert(data)
                if (error) throw error
                toast.success('Category created')
            }
            router.push('/admin/categories')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={category?.name}
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                defaultValue={category?.slug}
                                placeholder="category-url-slug"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={category?.description}
                            placeholder="Describe this category..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category Image</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={(urls) => setImageUrl(urls)}
                            multiple={false}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="is_featured" name="is_featured" defaultChecked={category?.is_featured} />
                        <Label htmlFor="is_featured" className="!mb-0">Featured Category</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl border shadow-lg">
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
