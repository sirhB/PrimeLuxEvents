'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical, Search } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

// Types for our local state
export type PackageOption = {
    id: string // temporary or real ID
    product_id: string
    product_name: string
    is_default: boolean
    quantity: number
}

export type PackageItemGroup = {
    id: string // temporary or real ID
    name: string
    description: string
    min_selections: number
    max_selections: number
    display_order: number
    options: PackageOption[]
}

interface PackageItemGroupBuilderProps {
    initialGroups?: PackageItemGroup[]
    products: any[] // List of available products to choose from
    onChange: (groups: PackageItemGroup[]) => void
}

export default function PackageItemGroupBuilder({
    initialGroups = [],
    products,
    onChange
}: PackageItemGroupBuilderProps) {
    const [groups, setGroups] = useState<PackageItemGroup[]>(initialGroups)
    const [searchTerm, setSearchTerm] = useState('')

    const addGroup = () => {
        const newGroup: PackageItemGroup = {
            id: `temp-${Date.now()}`,
            name: 'New Item Group',
            description: '',
            min_selections: 1,
            max_selections: 1,
            display_order: groups.length,
            options: []
        }
        const newGroups = [...groups, newGroup]
        setGroups(newGroups)
        onChange(newGroups)
    }

    const removeGroup = (groupId: string) => {
        const newGroups = groups.filter(g => g.id !== groupId)
        setGroups(newGroups)
        onChange(newGroups)
    }

    const updateGroup = (groupId: string, field: keyof PackageItemGroup, value: any) => {
        const newGroups = groups.map(g => {
            if (g.id === groupId) {
                return { ...g, [field]: value }
            }
            return g
        })
        setGroups(newGroups)
        onChange(newGroups)
    }

    const addOption = (groupId: string, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        const newGroups = groups.map(g => {
            if (g.id === groupId) {
                // Check if already exists
                if (g.options.some(o => o.product_id === productId)) return g

                const newOption: PackageOption = {
                    id: `opt-${Date.now()}`,
                    product_id: productId,
                    product_name: product.name,
                    is_default: g.options.length === 0, // First one is default
                    quantity: 1
                }
                return { ...g, options: [...g.options, newOption] }
            }
            return g
        })
        setGroups(newGroups)
        onChange(newGroups)
    }

    const removeOption = (groupId: string, optionId: string) => {
        const newGroups = groups.map(g => {
            if (g.id === groupId) {
                return { ...g, options: g.options.filter(o => o.id !== optionId) }
            }
            return g
        })
        setGroups(newGroups)
        onChange(newGroups)
    }

    const updateOption = (groupId: string, optionId: string, field: keyof PackageOption, value: any) => {
        const newGroups = groups.map(g => {
            if (g.id === groupId) {
                const newOptions = g.options.map(o => {
                    if (o.id === optionId) {
                        return { ...o, [field]: value }
                    }
                    return o
                })

                // If setting as default, unset others if single selection
                if (field === 'is_default' && value === true && g.max_selections === 1) {
                    newOptions.forEach(o => {
                        if (o.id !== optionId) o.is_default = false
                    })
                }

                return { ...g, options: newOptions }
            }
            return g
        })
        setGroups(newGroups)
        onChange(newGroups)
    }

    // Filter products for search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Configurable Item Groups</h3>
                <Button onClick={addGroup} type="button" variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Group
                </Button>
            </div>

            {groups.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    No configurable item groups added yet.
                    <br />
                    Click "Add Group" to create options like "Choose Your Linens".
                </div>
            )}

            <div className="space-y-4">
                {groups.map((group, index) => (
                    <Card key={group.id} className="border-l-4 border-l-gold">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="grid gap-4 flex-1 mr-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Group Name</Label>
                                            <Input
                                                value={group.name}
                                                onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                                                placeholder="e.g. Centerpiece Selection"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description (Optional)</Label>
                                            <Input
                                                value={group.description || ''}
                                                onChange={(e) => updateGroup(group.id, 'description', e.target.value)}
                                                placeholder="Instructions for client..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-32">
                                            <Label>Min Selections</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={group.min_selections}
                                                onChange={(e) => updateGroup(group.id, 'min_selections', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2 w-32">
                                            <Label>Max Selections</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={group.max_selections}
                                                onChange={(e) => updateGroup(group.id, 'max_selections', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGroup(group.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm text-muted-foreground">Available Options</Label>
                                    <div className="flex items-center gap-2">
                                        <Search className="h-3 w-3 text-muted-foreground" />
                                        <Select onValueChange={(val) => addOption(group.id, val)}>
                                            <SelectTrigger className="w-[250px] h-8">
                                                <SelectValue placeholder="Add product option..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <Input
                                                        placeholder="Search products..."
                                                        className="h-8 mb-2"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                {filteredProducts.slice(0, 10).map(product => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {group.options.map((option) => (
                                        <div key={option.id} className="flex items-center gap-3 bg-secondary/20 p-2 rounded-md border">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                            <div className="flex-1 font-medium text-sm">{option.product_name}</div>

                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs">Qty:</Label>
                                                <Input
                                                    type="number"
                                                    className="w-16 h-7 text-xs"
                                                    min="1"
                                                    value={option.quantity}
                                                    onChange={(e) => updateOption(group.id, option.id, 'quantity', parseInt(e.target.value) || 1)}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs">Default</Label>
                                                <Switch
                                                    checked={option.is_default}
                                                    onCheckedChange={(checked: boolean) => updateOption(group.id, option.id, 'is_default', checked)}
                                                />
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                                onClick={() => removeOption(group.id, option.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {group.options.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic text-center py-2">
                                            No options added yet. Select products above to add them to this group.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
