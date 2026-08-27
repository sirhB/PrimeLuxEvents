'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type BadgeCounts = {
  orders: number
  leads: number
  messages: number
}

type AdminChromeContextType = {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
  counts: BadgeCounts
  refreshCounts: () => Promise<void>
}

const AdminChromeContext = createContext<AdminChromeContextType | undefined>(undefined)

const EMPTY_COUNTS: BadgeCounts = { orders: 0, leads: 0, messages: 0 }

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [counts, setCounts] = useState<BadgeCounts>(EMPTY_COUNTS)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-sidebar-collapsed')
      if (saved) setIsCollapsed(JSON.parse(saved))
    } catch {
      // ignore corrupt preference
    }
  }, [])

  const handleSetCollapsed = useCallback((value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
  }, [])

  const refreshCounts = useCallback(async () => {
    try {
      const [ordersRes, leadsRes, messagesRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'new_request'),
        supabase
          .from('admin_notifications')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
          .eq('type', 'new_message'),
      ])
      setCounts({
        orders: ordersRes.count || 0,
        leads: leadsRes.count || 0,
        messages: messagesRes.count || 0,
      })
    } catch (error) {
      console.error('Error fetching admin badge counts:', error)
    }
  }, [supabase])

  useEffect(() => {
    void refreshCounts()

    const channel = supabase
      .channel('admin-badge-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void refreshCounts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        void refreshCounts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, () => {
        void refreshCounts()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refreshCounts, supabase])

  const value = useMemo(
    () => ({
      isCollapsed,
      setIsCollapsed: handleSetCollapsed,
      isMobileOpen,
      setIsMobileOpen,
      counts,
      refreshCounts,
    }),
    [isCollapsed, handleSetCollapsed, isMobileOpen, counts, refreshCounts],
  )

  return <AdminChromeContext.Provider value={value}>{children}</AdminChromeContext.Provider>
}

export function useAdminSidebar() {
  const context = useContext(AdminChromeContext)
  if (context === undefined) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider')
  }
  return context
}
