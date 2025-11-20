"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CatalogSearchProps {
    onSearch: (query: string) => void
    placeholder?: string
}

export function CatalogSearch({ onSearch, placeholder = "Search products..." }: CatalogSearchProps) {
    const [query, setQuery] = useState("")

    const handleSearch = (value: string) => {
        setQuery(value)
        onSearch(value)
    }

    const clearSearch = () => {
        setQuery("")
        onSearch("")
    }

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
            />
            {query && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
        </div>
    )
}
