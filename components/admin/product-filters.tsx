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

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete('category_id')
        } else {
            params.set('category_id', value)
        }
        params.set('page', '1') // Reset to first page
        router.push(`?${params.toString()}`)
    }

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('sort', value)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex gap-4">
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
