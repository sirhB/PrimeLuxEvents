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
import { Plus, Pencil, Trash2, LayoutDashboard, FileText, Image as ImageIcon, HelpCircle, BookOpen, ShoppingBag, Phone, Info, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { JsonEditor } from "@/components/admin/json-editor"
import { cn } from "@/lib/utils"

interface ContentItem {
    id: number
    key: string
    value: string
    type: 'text' | 'json' | 'image'
}

const PAGE_GROUPS = [
    { id: 'all', label: 'All Content', icon: LayoutDashboard },
    { id: 'home', label: 'Home', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'how_it_works', label: 'How It Works', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
    { id: 'contact', label: 'Contact', icon: Phone },
]

export default function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGroup, setSelectedGroup] = useState('all')
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

    const filteredContent = selectedGroup === 'all'
        ? content
        : content.filter(item => item.key.startsWith(selectedGroup + '.'))

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
        <div className="flex h-[calc(100vh-4rem)] gap-6">
            {/* Sidebar */}
            <div className="w-64 shrink-0 border-r pr-6 py-4">
                <div className="space-y-1">
                    {PAGE_GROUPS.map((group) => {
                        const Icon = group.icon
                        return (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroup(group.id)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    selectedGroup === group.id
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {group.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-4 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif">Content Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage content for {PAGE_GROUPS.find(g => g.id === selectedGroup)?.label}
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) setEditingItem(null)
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Content
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit Content' : 'Add New Content'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    {editingItem?.type === 'json' ? (
                                        <div className="border rounded-md p-4 bg-muted/10">
                                            <input type="hidden" name="value" id="value" defaultValue={editingItem?.value} />
                                            <JsonEditor
                                                value={editingItem?.value}
                                                onChange={(val) => {
                                                    const input = document.getElementById('value') as HTMLInputElement
                                                    if (input) input.value = val
                                                    setEditingItem(prev => prev ? { ...prev, value: val } : null)
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Textarea
                                            id="value"
                                            name="value"
                                            defaultValue={editingItem?.value}
                                            required
                                            className="min-h-[200px] font-mono text-sm"
                                            placeholder="Content value..."
                                        />
                                    )}
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
                                <TableHead className="w-[300px]">Key</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredContent.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No content found for this section.</TableCell>
                                </TableRow>
                            ) : (
                                filteredContent.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono text-xs">{item.key}</TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
                                                item.type === 'json' ? "bg-blue-100 text-blue-800" :
                                                    item.type === 'image' ? "bg-purple-100 text-purple-800" :
                                                        "bg-secondary text-secondary-foreground"
                                            )}>
                                                {item.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs truncate max-w-[400px]">
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
        </div>
    )
}
