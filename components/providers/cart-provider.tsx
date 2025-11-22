"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type EventDetails, EventDetailsDialog } from "@/components/event-details-dialog"

type CartItem = {
  productId: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
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

  const addItem = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
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
