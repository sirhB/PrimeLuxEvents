import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

export default async function EditPackagePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: pkg } = await supabase
        .from('packages')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!pkg) {
        redirect('/admin/packages')
    }

    async function updatePackage(formData: FormData) {
        'use server'

        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string) * 100 // Convert to cents
        const image_url = formData.get('image_url') as string
        const is_featured = formData.get('is_featured') === 'on'

        const supabase = await createClient()

        const { error } = await supabase
            .from('packages')
            .update({
                name,
                description,
                price,
                image_url,
                is_featured
            })
            .eq('id', params.id)

        if (error) {
            console.error('Error updating package:', error)
            return
        }

        redirect('/admin/packages')
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Package</h1>
                <Button variant="outline" asChild>
                    <Link href="/admin/packages">Cancel</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updatePackage} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={pkg.name} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={pkg.description || ''} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={(pkg.price / 100).toFixed(2)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input id="image_url" name="image_url" defaultValue={pkg.image_url || ''} placeholder="https://..." />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_featured" name="is_featured" defaultChecked={pkg.is_featured} />
                            <Label htmlFor="is_featured">Featured Package</Label>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
