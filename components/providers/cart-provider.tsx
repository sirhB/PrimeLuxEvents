"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type EventDetails, EventDetailsDialog } from "@/components/event-details-dialog"

export type CartItem = {
  id: string
  productId: string
  quantity: number
  modifiers?: Record<string, any>
}

type CartContextType = {
  items: CartItem[]
  addItem: (productId: string, quantity?: number, modifiers?: Record<string, any>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  eventDetails: EventDetails | null
  setEventDetails: (details: EventDetails) => void
  openEventDetails: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [eventDetails, setEventDetailsState] = useState<EventDetails | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("primelux-cart")
    const savedEventDetails = localStorage.getItem("primelux-event-details")

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart from local storage")
      }
    }

    if (savedEventDetails) {
      try {
        // Need to convert date string back to Date object
        const parsed = JSON.parse(savedEventDetails)
        if (parsed.date) parsed.date = new Date(parsed.date)
        setEventDetailsState(parsed)
      } catch (e) {
        console.error("Failed to parse event details")
      }
    }

    setIsLoaded(true)
  }, [])

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("primelux-cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Save event details to local storage
  useEffect(() => {
    if (isLoaded && eventDetails) {
      localStorage.setItem("primelux-event-details", JSON.stringify(eventDetails))
    }
  }, [eventDetails, isLoaded])

  const addItem = (productId: string, quantity: number = 1, modifiers: Record<string, any> = {}) => {
    setItems((prev) => {
      // Check if item with same product ID AND same modifiers exists
      const existing = prev.find((item) =>
        item.productId === productId &&
        JSON.stringify(item.modifiers || {}) === JSON.stringify(modifiers)
      )

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prev, {
        id: crypto.randomUUID(),
        productId,
        quantity,
        modifiers
      }]
    })
  }

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))
  }

  const handleEventDetailsSubmit = (details: EventDetails) => {
    setEventDetailsState(details)
    setIsEventDialogOpen(false)
  }

  const clearCart = () => {
    setItems([])
  }

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        eventDetails,
        setEventDetails: setEventDetailsState,
        openEventDetails: () => setIsEventDialogOpen(true),
        isLoaded,
      }}
    >
      {children}
      <EventDetailsDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSubmit={handleEventDetailsSubmit}
        initialData={eventDetails}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
