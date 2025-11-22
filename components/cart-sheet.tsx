"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2, Plus, Minus, Calendar, MapPin, Check } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { products } from "@/lib/data"
import { format } from "date-fns"

export function CartSheet() {
  const { items, removeItem, updateQuantity, cartCount, clearCart, eventDetails, openEventDetails } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background border-l border-border">
        <SheetHeader className="space-y-2.5 pr-6 border-b border-border pb-4">
          <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
          <SheetDescription>Review your items and proceed to checkout.</SheetDescription>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-serif">Request Sent!</h3>
            <p className="text-muted-foreground">
              We've received your quote request. Our team will review your selection and get back to you within 24
              hours.
            </p>
          </div>
        ) : (
          <>
            {eventDetails && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border text-sm space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground">Event Details</h4>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={openEventDetails}>
                    Edit
                  </Button>
                </div>
                <div className="grid gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {eventDetails.date ? format(new Date(eventDetails.date), "MMM d, yyyy") : "Date TBD"} •{" "}
                      {eventDetails.startTime} - {eventDetails.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{eventDetails.venueAddress}</span>
                  </div>
                  <div className="text-xs pt-1 border-t border-border/50 mt-1">
                    {eventDetails.eventType} • {eventDetails.venueType.replace("_", " ")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Your quote is empty</p>
                    <p className="text-sm text-muted-foreground">Browse our collection and add items to get started.</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Browse Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    if (!product) return null

                    return (
                      <div key={item.productId} className="flex gap-4">
                        <div className="h-20 w-20 rounded-md border bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between gap-2">
                            <h3 className="font-medium line-clamp-2 font-serif">{product.name}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <div className="flex items-center gap-2 border rounded-md p-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm w-4 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{cartCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tax and delivery fees will be calculated at checkout based on your delivery address.
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-base"
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
