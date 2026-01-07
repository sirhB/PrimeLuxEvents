"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2, Plus, Minus, Check, ArrowRight, X } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function CartSheet() {
  const { items, removeItem, updateQuantity, cartCount, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = items
        .filter(item => item.productId)
        .map(item => item.productId)

      if (productIds.length === 0) {
        setProducts([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .in('id', productIds)

      if (data) {
        setProducts(data)
      }
    }

    fetchProducts()
  }, [items])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-[10px] font-bold flex items-center justify-center text-black shadow-sm">
              {cartCount}
            </span>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-[#FDFBF7] border-l border-border/10 p-0 overflow-hidden">
        <SheetHeader className="px-8 pt-10 pb-6 border-b border-border/5 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="font-serif text-3xl font-light tracking-tight">Your Selection</SheetTitle>
          </div>
          <SheetDescription className="text-sm font-light text-gray-500">
            Review your curated items for your upcoming event.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-8"
              >
                <div className="h-24 w-24 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-center border border-border/5">
                  <ShoppingBag className="h-10 w-10 text-gold/30" />
                </div>
                <div className="space-y-3">
                  <p className="font-serif text-xl font-bold text-gray-900">Your collection is empty</p>
                  <p className="text-sm text-gray-500 font-light max-w-[240px] mx-auto leading-relaxed">
                    Browse our catalog to discover premium pieces for your next extraordinary event.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full px-10 border-gold/20 hover:border-gold hover:bg-gold/5 text-gold font-bold uppercase tracking-widest text-[10px]"
                >
                  Explore Catalog
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {items.map((item) => {
                  // Handle Package Items
                  if (item.packageId && item.packageData) {
                    const { name, price } = item.packageData
                    const itemPrice = price // Price is already in cents and includes savings

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-6 group"
                      >
                        <div className="h-28 w-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-border/5 bg-white relative">
                          <div className="absolute inset-0 bg-gold/5 flex items-center justify-center">
                            <span className="text-xs text-gold font-bold uppercase tracking-widest">Package</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight">{name}</h3>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                              Package Deal
                            </div>

                            {/* Compact Selection Summary */}
                            {item.packageData.selectionsSummary && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.packageData.selectionsSummary.flatMap((g: any) => g.items).slice(0, 4).map((sel: any, sIdx: number) => (
                                  <span key={sIdx} className="text-[9px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                    {sel.name}
                                  </span>
                                ))}
                                {item.packageData.selectionsSummary.flatMap((g: any) => g.items).length > 4 && (
                                  <span className="text-[9px] text-gray-400 px-1 italic">
                                    +{item.packageData.selectionsSummary.flatMap((g: any) => g.items).length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4 bg-white rounded-full px-3 py-1 shadow-sm border border-border/5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="text-gray-400 hover:text-gold disabled:opacity-30 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-gray-400 hover:text-gold transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(itemPrice * item.quantity)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }

                  // Handle Product Items
                  const product = products.find((p) => p.id === item.productId)
                  if (!product) return null

                  const price = product.rental_price_daily || product.price
                  const modifiersPrice = Object.values(item.modifiers || {}).reduce((acc: number, curr: any) => {
                    return acc + (curr.priceAdjustment || 0)
                  }, 0)
                  const itemPrice = price + modifiersPrice

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-6 group"
                    >
                      <div className="h-28 w-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-border/5 bg-white">
                        <Link href={`/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`} onClick={() => setIsOpen(false)}>
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </Link>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-4">
                            <Link href={`/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`} onClick={() => setIsOpen(false)} className="flex-1">
                              <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-gold transition-colors leading-tight">{product.name}</h3>
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Modifiers */}
                          {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                              {Object.entries(item.modifiers).map(([key, option]: [string, any]) => (
                                <div key={key} className="flex items-center gap-1">
                                  <span className="text-gold/60">{key}:</span>
                                  <span className="text-gray-600">{option.label || option.name || option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 bg-white rounded-full px-3 py-1 shadow-sm border border-border/5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="text-gray-400 hover:text-gold disabled:opacity-30 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="text-gray-400 hover:text-gold transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(itemPrice * item.quantity)}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div className="px-8 py-10 border-t border-border/5 bg-white/50 backdrop-blur-md space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Subtotal</span>
                <span className="font-serif text-2xl font-light text-gray-900">
                  {formatCurrency(items.reduce((acc, item) => {
                    // Handle Package
                    if (item.packageId && item.packageData) {
                      return acc + (item.packageData.price * item.quantity)
                    }

                    // Handle Product
                    if (item.productId) {
                      const product = products.find(p => p.id === item.productId)
                      if (!product) return acc
                      const price = product.rental_price_daily || product.price
                      const modifiersPrice = Object.values(item.modifiers || {}).reduce((mAcc: number, curr: any) => mAcc + (curr.priceAdjustment || 0), 0)
                      return acc + (price + modifiersPrice) * item.quantity
                    }

                    return acc
                  }, 0))}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-light leading-relaxed uppercase tracking-widest text-center">
                Final pricing including delivery & tax will be calculated at checkout.
              </p>
            </div>
            <Button
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all duration-500 group shadow-xl"
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/checkout'
              }}
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
