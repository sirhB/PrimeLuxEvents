"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, LayoutDashboard, FileText, Image as ImageIcon, HelpCircle, BookOpen, ShoppingBag, Phone, Info, Settings, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { ContentEditor } from "@/components/admin/content-editor"
import { cn } from "@/lib/utils"
import { getLabelFromKey, groupContentBySection, ContentItem, GroupedContent } from "@/lib/cms-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PAGE_GROUPS = [
    { id: 'all', label: 'All Content', icon: LayoutDashboard },
    { id: 'home', label: 'Home', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'howitworks', label: 'How It Works', icon: HelpCircle },
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
    const [groupedContent, setGroupedContent] = useState<GroupedContent[]>([])

    // Form state
    const [formKey, setFormKey] = useState('')
    const [formValue, setFormValue] = useState('')
    const [formType, setFormType] = useState<'text' | 'json' | 'image'>('text')

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchContent()
    }, [])

    useEffect(() => {
        if (editingItem) {
            setFormKey(editingItem.key)
            setFormValue(editingItem.value)
            setFormType(editingItem.type)
        } else {
            // Reset form for new item
            // If we are in a specific page group, pre-fill the key prefix
            setFormKey(selectedGroup !== 'all' ? `${selectedGroup}.` : '')
            setFormValue('')
            setFormType('text')
        }
    }, [editingItem, selectedGroup, isDialogOpen])

    useEffect(() => {
        const filtered = selectedGroup === 'all'
            ? content
            : content.filter(item => item.key.startsWith(selectedGroup + '.'))

        setGroupedContent(groupContentBySection(filtered))
    }, [content, selectedGroup])

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (editingItem) {
            const { error } = await supabase
                .from('content')
                .update({ key: formKey, value: formValue, type: formType })
                .eq('id', editingItem.id)

            if (error) console.error('Error updating content:', error)
        } else {
            const { error } = await supabase
                .from('content')
                .insert([{ key: formKey, value: formValue, type: formType }])

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
            <div className="w-64 shrink-0 border-r pr-6 py-4 overflow-y-auto">
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
            <div className="flex-1 py-4 space-y-6 overflow-auto pr-6">
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
                        {/* Add Content button removed as per requirements */}
                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Content</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="key">Key</Label>
                                        <div className="p-2 bg-muted rounded-md text-sm font-mono text-muted-foreground border">
                                            {formKey}
                                        </div>
                                        {/* Hidden input to ensure key is still submitted if needed, though we use state */}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <div className="p-2 bg-muted rounded-md text-sm font-medium text-muted-foreground border capitalize">
                                            {formType}
                                        </div>
                                    </div>
                                </div>

                                <ContentEditor
                                    type={formType}
                                    value={formValue}
                                    onChange={setFormValue}
                                    label={editingItem ? getLabelFromKey(editingItem.key) : "Value"}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading content...</div>
                ) : groupedContent.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No content found for this section.</div>
                ) : (
                    <div className="space-y-8">
                        {groupedContent.map((group) => (
                            <div key={group.section} className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary/80 border-b pb-2">
                                    {group.section}
                                    <Badge variant="secondary" className="text-xs font-normal">{group.items.length} items</Badge>
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {group.items.map((item) => (
                                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                            <CardHeader className="pb-2 space-y-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <CardTitle className="text-base font-medium leading-tight">
                                                        {getLabelFromKey(item.key)}
                                                    </CardTitle>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono truncate" title={item.key}>
                                                    {item.key}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {item.type === 'image' ? (
                                                    <div className="aspect-video rounded-md bg-muted overflow-hidden relative">
                                                        <img src={item.value} alt={item.key} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : item.type === 'json' ? (
                                                    <div className="bg-muted/30 rounded p-2 text-xs font-mono h-24 overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/10 pointer-events-none" />
                                                        {item.value}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
