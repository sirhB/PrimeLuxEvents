'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface CategoryFormProps {
    category?: any
}

export function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            description: formData.get('description') as string,
            image_url: formData.get('image_url') as string,
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={category?.name}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={category?.slug}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={category?.description}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={category?.image_url}
                    placeholder="https://..."
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="is_featured" name="is_featured" defaultChecked={category?.is_featured} />
                <Label htmlFor="is_featured">Featured Category</Label>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
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
