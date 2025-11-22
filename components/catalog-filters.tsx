"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface FilterOptions {
    categories: string[]
    priceRange: [number, number]
    features: string[]
}

interface CatalogFiltersProps {
    categories: string[]
    onFilterChange: (filters: FilterOptions) => void
    maxPrice?: number
}

export function CatalogFilters({ categories, onFilterChange, maxPrice = 1000 }: CatalogFiltersProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [open, setOpen] = useState(false)

    const featureOptions = [
        "Indoor Use",
        "Outdoor Use",
        "Stackable",
        "Foldable",
        "Weather Resistant",
        "Luxury",
        "Modern",
        "Vintage",
        "Rustic"
    ]

    const applyFilters = () => {
        onFilterChange({
            categories: selectedCategories,
            priceRange,
            features: selectedFeatures
        })
    }

    const clearFilters = () => {
        setSelectedCategories([])
        setPriceRange([0, maxPrice])
        setSelectedFeatures([])
        onFilterChange({
            categories: [],
            priceRange: [0, maxPrice],
            features: []
        })
    }

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        )
    }

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    const hasActiveFilters = selectedCategories.length > 0 ||
        selectedFeatures.length > 0 ||
        priceRange[0] !== 0 ||
        priceRange[1] !== maxPrice

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {selectedCategories.length + selectedFeatures.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                        Refine your search with advanced filters
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-6">
                    <div className="space-y-6">
                        {/* Categories */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Categories</Label>
                            <div className="space-y-2">
                                {categories.filter(c => c !== "All").map((category) => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`category-${category}`}
                                            checked={selectedCategories.includes(category)}
                                            onCheckedChange={() => toggleCategory(category)}
                                        />
                                        <Label
                                            htmlFor={`category-${category}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {category}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Price Range */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Price Range</Label>
                            <div className="space-y-3">
                                <Slider
                                    min={0}
                                    max={maxPrice}
                                    step={10}
                                    value={priceRange}
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Features */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Features</Label>
                            <div className="space-y-2">
                                {featureOptions.map((feature) => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`feature-${feature}`}
                                            checked={selectedFeatures.includes(feature)}
                                            onCheckedChange={() => toggleFeature(feature)}
                                        />
                                        <Label
                                            htmlFor={`feature-${feature}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {feature}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                    <Button onClick={() => { applyFilters(); setOpen(false); }} className="flex-1">
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
