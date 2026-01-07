'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Category {
    id: string
    name: string
}

interface ProductFiltersProps {
    categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentCategory = searchParams.get('category_id') || 'all'
    const currentSort = searchParams.get('sort') || 'newest'
    const currentStock = searchParams.get('stock_status') || 'all'

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('category_id')
        } else {
            params.set('category_id', value)
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', value)
        router.push(`?${params.toString()}`)
    }

    const handleStockChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('stock_status')
        } else {
            params.set('stock_status', value)
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-4">
            <Select value={currentCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentStock} onValueChange={handleStockChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stock Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock (≤ 5)</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>

            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">Name: A-Z</SelectItem>
                    <SelectItem value="name_desc">Name: Z-A</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
