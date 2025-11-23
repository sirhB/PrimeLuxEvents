"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2, Plus, Minus, Check } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

export function CartSheet() {
  const { items, removeItem, updateQuantity, cartCount, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', items.map(item => item.productId))

      if (data) {
        setProducts(data)
      }
    }

    fetchProducts()
  }, [items])

  const handleSubmit = () => {
    // Mock API call
    setIsSuccess(true)
    setTimeout(() => {
      clearCart()
      setIsSuccess(false)
      setIsOpen(false)
    }, 3000)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background border-l border-border/50">
        <SheetHeader className="space-y-3 px-6 pt-6 pb-6 border-b border-border/50">
          <SheetTitle className="font-serif text-3xl">Your Cart</SheetTitle>
          <SheetDescription className="text-base">Review your items and proceed to checkout.</SheetDescription>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <Check className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Request Sent!</h3>
              <p className="text-muted-foreground max-w-sm">
                We've received your quote request. Our team will review your selection and get back to you within 24
                hours.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-lg">Your quote is empty</p>
                    <p className="text-sm text-muted-foreground max-w-xs">Browse our collection and add items to get started.</p>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => setIsOpen(false)}>
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    if (!product) return null

                    const price = product.rental_price_daily || product.price

                    return (
                      <div key={item.productId} className="flex gap-5 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                        <div className="h-24 w-24 rounded-lg border border-border/50 bg-background overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="space-y-2">
                            <div className="flex justify-between gap-3">
                              <h3 className="font-serif text-base font-medium line-clamp-2 pr-2">{product.name}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-gold">{formatCurrency(price)} <span className="text-xs text-muted-foreground">/ day</span></p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 border border-border/50 rounded-lg p-1 bg-background">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-secondary"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-secondary"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <p className="text-sm font-semibold">{formatCurrency(price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border/50 px-6 py-6 space-y-6 bg-secondary/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-semibold text-lg">{cartCount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tax and delivery fees will be calculated at checkout based on your delivery address.
                  </p>
                </div>
                <Button
                  className="w-full h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  onClick={() => {
                    setIsOpen(false)
                    window.location.href = '/checkout'
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
