'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import PackageStaticItemsBuilder, { PackageStaticItem } from '@/components/admin/PackageStaticItemsBuilder'
import { createPackageWithItems, updatePackageWithItems, PackageData, ItemGroupData, StaticItemData } from '../actions'
import PackageItemGroupBuilder, { PackageItemGroup } from '@/components/admin/PackageItemGroupBuilder'
import PackageDiscountCalculator from '@/components/admin/PackageDiscountCalculator'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface PackageBuilderFormProps {
    products: any[]
    initialData?: {
        id: string
        package: PackageData
        groups: PackageItemGroup[]
        staticItems: PackageStaticItem[]
    }
}

export default function PackageBuilderForm({ products, initialData }: PackageBuilderFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const isEditing = !!initialData

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        name: initialData?.package.name || '',
        description: initialData?.package.description || '',
        image_url: initialData?.package.image_url || '',
        is_featured: initialData?.package.is_featured || false
    })

    const [itemGroups, setItemGroups] = useState<PackageItemGroup[]>(initialData?.groups || [])
    const [staticItems, setStaticItems] = useState<PackageStaticItem[]>(initialData?.staticItems || [])

    const [pricing, setPricing] = useState({
        price: initialData?.package.price || 0,
        discountType: initialData?.package.discount_type || 'percentage' as 'percentage' | 'fixed_amount',
        discountValue: initialData?.package.discount_value || 0,
        originalPrice: initialData?.package.original_price || 0,
        savingsAmount: initialData?.package.savings_amount || 0
    })

    const handleSubmit = async () => {
        if (!basicInfo.name) {
            toast.error('Package name is required')
            setActiveTab('basic')
            return
        }

        if (pricing.price <= 0) {
            toast.error('Package price must be greater than 0')
            setActiveTab('pricing')
            return
        }

        setIsSubmitting(true)

        try {
            const packageData: PackageData = {
                ...basicInfo,
                price: pricing.price, // already in cents from calculator
                discount_type: pricing.discountType,
                discount_value: pricing.discountValue,
                original_price: pricing.originalPrice,
                savings_amount: pricing.savingsAmount
            }

            // Convert UI groups to API format
            const groupsData: ItemGroupData[] = itemGroups.map(g => ({
                name: g.name,
                description: g.description,
                min_selections: g.min_selections,
                max_selections: g.max_selections,
                display_order: g.display_order,
                options: g.options.map(o => ({
                    product_id: o.product_id,
                    is_default: o.is_default,
                    quantity: o.quantity
                }))
            }))

            // Convert UI static items to API format
            const staticItemsData: StaticItemData[] = staticItems.map(i => ({
                product_id: i.product_id,
                quantity: i.quantity
            }))

            if (isEditing && initialData) {
                await updatePackageWithItems(initialData.id, packageData, groupsData, staticItemsData)
                toast.success('Package updated successfully')
            } else {
                await createPackageWithItems(packageData, groupsData, staticItemsData)
                toast.success('Package created successfully')
            }

            router.push('/admin/packages')
        } catch (error) {
            console.error(error)
            toast.error(isEditing ? 'Failed to update package' : 'Failed to create package')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">1. Basic Info</TabsTrigger>
                    <TabsTrigger value="static">2. Included Items</TabsTrigger>
                    <TabsTrigger value="items">3. Configurable Items</TabsTrigger>
                    <TabsTrigger value="pricing">4. Pricing & Discounts</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Package Name</Label>
                                    <Input
                                        id="name"
                                        value={basicInfo.name}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                        placeholder="e.g. Gold Wedding Package"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={basicInfo.description}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                        placeholder="Describe what makes this package special..."
                                        className="h-32"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image_url">Cover Image URL</Label>
                                    <Input
                                        id="image_url"
                                        value={basicInfo.image_url}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_featured"
                                        checked={basicInfo.is_featured}
                                        onCheckedChange={(checked) => setBasicInfo({ ...basicInfo, is_featured: checked as boolean })}
                                    />
                                    <Label htmlFor="is_featured">Feature this package on the homepage</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end mt-6">
                            <Button onClick={() => setActiveTab('static')}>
                                Next: Included Items
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="static">
                        <PackageStaticItemsBuilder
                            initialItems={staticItems}
                            products={products}
                            onChange={setStaticItems}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setActiveTab('basic')}>
                                Back
                            </Button>
                            <Button onClick={() => setActiveTab('items')}>
                                Next: Configurable Items
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="items">
                        <PackageItemGroupBuilder
                            initialGroups={itemGroups}
                            products={products}
                            onChange={setItemGroups}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setActiveTab('static')}>
                                Back
                            </Button>
                            <Button onClick={() => setActiveTab('pricing')}>
                                Next: Pricing & Discounts
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="pricing">
                        <PackageDiscountCalculator
                            groups={itemGroups}
                            products={products}
                            initialPrice={pricing.price}
                            initialDiscountType={pricing.discountType}
                            initialDiscountValue={pricing.discountValue}
                            onChange={setPricing}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setActiveTab('items')}>
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gold hover:bg-gold/90 text-black">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditing ? 'Update Package' : 'Create Package'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
