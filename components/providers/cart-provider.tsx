"use client"

import { createContext, useCallback, useContext, useRef, useState, useEffect, type ReactNode } from "react"
import { type EventDetails, EventDetailsDialog } from "@/components/event-details-dialog"
import { PlanSheet } from "@/components/plan/plan-sheet"
import { getLeadSnapshot, syncLeadCart, type LeadSnapshot } from "@/app/plan/lead-actions"
import { LEAD_STORAGE_KEY, type PlanLeadDraft } from "@/lib/leads/plan-options"

export type CartItem = {
  id: string
  productId?: string // Optional for package items
  quantity: number
  modifiers?: Record<string, any>
  packageId?: string // For package items
  packageSelections?: Record<string, string[]> // For package items
  packageData?: { // For package items
    name: string
    price: number
    image_url?: string
    original_price: number
    savings_amount: number
    selectionsSummary?: {
      groupName: string
      items: { name: string; quantity: number }[]
    }[]
  }
}

type CartContextType = {
  items: CartItem[]
  addItem: (productId: string, quantity?: number, modifiers?: Record<string, any>) => void
  addPackageItem: (packageId: string, packageSelections: Record<string, string[]>, packageData: { name: string; price: number; image_url?: string; original_price: number; savings_amount: number; selectionsSummary?: any[] }, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  eventDetails: EventDetails | null
  setEventDetails: (details: EventDetails) => void
  openEventDetails: () => void
  isLoaded: boolean
  /** True once the visitor has completed (or is linked to) a Plan-your-event lead. */
  hasLead: boolean
  leadId: string | null
  lead: LeadSnapshot | null
  setLeadDone: (leadId: string) => void
  /** Open the plan flow. With a lead it opens in edit mode. */
  openPlan: (opts?: { intent?: "cart" | "plan"; draft?: Partial<PlanLeadDraft>; step?: number }) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [eventDetails, setEventDetailsState] = useState<EventDetails | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [lead, setLead] = useState<LeadSnapshot | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const [planIntent, setPlanIntent] = useState<"cart" | "plan">("plan")
  const [planDraft, setPlanDraft] = useState<Partial<PlanLeadDraft> | null>(null)
  const [planStep, setPlanStep] = useState(0)
  const pendingAdd = useRef<null | (() => void)>(null)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fast path from local storage, then reconcile with the server (httpOnly token / signed-in account).
  useEffect(() => {
    try { setLeadId(localStorage.getItem(LEAD_STORAGE_KEY)) } catch { /* private mode */ }
    let alive = true
    getLeadSnapshot().then((snap) => {
      if (!alive) return
      setLead(snap)
      try {
        if (snap.hasLead && snap.leadId) localStorage.setItem(LEAD_STORAGE_KEY, snap.leadId)
        else localStorage.removeItem(LEAD_STORAGE_KEY)
      } catch { /* ignore */ }
      setLeadId(snap.hasLead ? snap.leadId : null)
    }).catch(() => null)
    return () => { alive = false }
  }, [])

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

  const rawAddItem = (productId: string, quantity: number = 1, modifiers: Record<string, any> = {}) => {
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

  const rawAddPackageItem = (
    packageId: string,
    packageSelections: Record<string, string[]>,
    packageData: any,
    quantity: number = 1
  ) => {
    setItems((prev) => {
      // Check if package with same selections exists
      const existing = prev.find((item) =>
        item.packageId === packageId &&
        JSON.stringify(item.packageSelections || {}) === JSON.stringify(packageSelections)
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
        packageId,
        quantity,
        packageSelections,
        packageData
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

  const hasLead = Boolean(leadId)

  // The first add opens the plan flow; the add is replayed once the lead exists.
  const gate = (run: () => void) => {
    if (hasLead) return run()
    pendingAdd.current = run
    setPlanIntent("cart")
    setPlanOpen(true)
  }
  const addItem: CartContextType["addItem"] = (productId, quantity = 1, modifiers = {}) =>
    gate(() => rawAddItem(productId, quantity, modifiers))
  const addPackageItem: CartContextType["addPackageItem"] = (packageId, selections, data, quantity = 1) =>
    gate(() => rawAddPackageItem(packageId, selections, data, quantity))

  const openPlan = useCallback((opts?: { intent?: "cart" | "plan"; draft?: Partial<PlanLeadDraft>; step?: number }) => {
    setPlanIntent(opts?.intent ?? "plan")
    setPlanDraft(opts?.draft ?? null)
    setPlanStep(opts?.step ?? 0)
    setPlanOpen(true)
  }, [])

  const onPlanDone = (id: string) => {
    setLeadId(id)
    try { localStorage.setItem(LEAD_STORAGE_KEY, id) } catch { /* ignore */ }
    setPlanOpen(false)
    const run = pendingAdd.current
    pendingAdd.current = null
    run?.()
    getLeadSnapshot().then(setLead).catch(() => null)
  }

  // Persist the cart server-side against the lead (debounced).
  useEffect(() => {
    if (!isLoaded || !leadId) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => { syncLeadCart(items).catch(() => null) }, 700)
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [items, isLoaded, leadId])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addPackageItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        eventDetails,
        setEventDetails: setEventDetailsState,
        openEventDetails: () => setIsEventDialogOpen(true),
        isLoaded,
        hasLead,
        leadId,
        lead,
        setLeadDone: onPlanDone,
        openPlan,
      }}
    >
      {children}
      <EventDetailsDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSubmit={handleEventDetailsSubmit}
        initialData={eventDetails}
      />
      <PlanSheet
        key={planOpen ? `open-${leadId ?? "new"}` : "closed"}
        open={planOpen}
        onClose={() => { pendingAdd.current = null; setPlanOpen(false) }}
        intent={planIntent}
        editing={hasLead}
        initial={{ ...(hasLead ? lead?.details : {}), ...(planDraft || {}) }}
        initialStep={planStep}
        prefill={lead?.prefill}
        onDone={onPlanDone}
        onSkip={hasLead ? () => setPlanOpen(false) : undefined}
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
