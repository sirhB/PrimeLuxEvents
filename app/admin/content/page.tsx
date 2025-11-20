"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContentItem {
    id: number
    key: string
    value: string
    type: 'text' | 'json' | 'image'
}

export default function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchContent()
    }, [])

    async function fetchContent() {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('key')

        if (error) {
            console.error('Error fetching content:', error)
        } else {
            setContent(data || [])
        }
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const key = formData.get('key') as string
        const value = formData.get('value') as string
        const type = formData.get('type') as 'text' | 'json' | 'image'

        if (editingItem) {
            const { error } = await supabase
                .from('content')
                .update({ key, value, type })
                .eq('id', editingItem.id)

            if (error) console.error('Error updating content:', error)
        } else {
            const { error } = await supabase
                .from('content')
                .insert([{ key, value, type }])

            if (error) console.error('Error creating content:', error)
        }

        setIsDialogOpen(false)
        setEditingItem(null)
        fetchContent()
        router.refresh()
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this content item?')) return

        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting content:', error)
        } else {
            fetchContent()
            router.refresh()
        }
    }

    function openEditDialog(item: ContentItem) {
        setEditingItem(item)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif">Content Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingItem(null)
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Content
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Content' : 'Add New Content'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key">Key</Label>
                                <Input
                                    id="key"
                                    name="key"
                                    defaultValue={editingItem?.key}
                                    required
                                    placeholder="e.g., home.hero.title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={editingItem?.type || 'text'}
                                >
                                    <option value="text">Text</option>
                                    <option value="json">JSON</option>
                                    <option value="image">Image URL</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Textarea
                                    id="value"
                                    name="value"
                                    defaultValue={editingItem?.value}
                                    required
                                    className="min-h-[200px] font-mono text-sm"
                                    placeholder="Content value..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-[50%]">Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : content.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No content found.</TableCell>
                            </TableRow>
                        ) : (
                            content.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.key}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            {item.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs truncate max-w-[300px]">
                                        {item.value}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
