"use client"

import { useState } from "react"
import Link from "next/link"
import { products, categories } from "@/lib/data"
import Image from "next/image"
import { Check, Plus } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { items, addItem, removeItem } = useCart()

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory)

  const isInCart = (id: string) => items.some((item) => item.productId === id)

  const toggleCart = (id: string) => {
    if (isInCart(id)) {
      removeItem(id)
    } else {
      addItem(id)
    }
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-6">
          <h1 className="text-4xl md:text-6xl font-serif">The Collection</h1>
          <p className="text-muted-foreground">{filteredProducts.length} items</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                <Link href={`/catalog/${product.id}`}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleCart(product.id)
                  }}
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-background transition-colors z-10"
                >
                  {isInCart(product.id) ? <Check className="h-5 w-5 text-green-600" /> : <Plus className="h-5 w-5" />}
                  <span className="sr-only">Add to quote</span>
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/catalog/${product.id}`}>
                    <h3 className="font-serif text-lg hover:underline decoration-1 underline-offset-4">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <span className="font-medium">${product.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
