'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ContentItem {
    id: string
    key: string
    value: string
    type: string
}

export default function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('key')

        if (error) {
            toast.error('Failed to load content')
        } else {
            setContent(data || [])
        }
        setLoading(false)
    }

    const handleUpdate = async (id: string, value: string) => {
        const { error } = await supabase
            .from('content')
            .update({ value })
            .eq('id', id)

        if (error) {
            toast.error('Failed to update content')
        } else {
            toast.success('Content updated')
            fetchContent()
        }
    }

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const key = formData.get('key') as string
        const value = formData.get('value') as string
        const type = formData.get('type') as string

        const { error } = await supabase
            .from('content')
            .insert({ key, value, type })

        if (error) {
            toast.error('Failed to create content')
        } else {
            toast.success('Content created')
            fetchContent()
            e.currentTarget.reset()
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key">Key (e.g., home.hero.title)</Label>
                                <Input id="key" name="key" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Textarea id="value" name="value" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Input id="type" name="type" defaultValue="text" />
                            </div>
                            <Button type="submit">Add Content</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {content.map((item) => (
                                <div key={item.id} className="space-y-2 rounded-lg border p-4">
                                    <div className="font-medium text-sm text-muted-foreground">{item.key}</div>
                                    <div className="flex gap-2">
                                        <Textarea
                                            defaultValue={item.value}
                                            onBlur={(e) => handleUpdate(item.id, e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            ))}
                            {content.length === 0 && (
                                <div className="text-center text-muted-foreground">
                                    No content items found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
