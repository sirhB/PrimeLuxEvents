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
  /** null while loading; string permission names once loaded */
  permissionNames: string[] | null
  roleNames: string[] | null
}

const AdminChromeContext = createContext<AdminChromeContextType | undefined>(undefined)

const EMPTY_COUNTS: BadgeCounts = { orders: 0, leads: 0, messages: 0 }

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [counts, setCounts] = useState<BadgeCounts>(EMPTY_COUNTS)
  const [permissionNames, setPermissionNames] = useState<string[] | null>(null)
  const [roleNames, setRoleNames] = useState<string[] | null>(null)
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
    let mounted = true
    async function loadPermissions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || !mounted) return

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select(
            `
            roles (
              name,
              role_permissions (
                permissions ( name )
              )
            )
          `,
          )
          .eq('user_id', user.id)

        const roles: string[] = []
        const permissions = new Set<string>()
        for (const row of userRoles || []) {
          const role = (row as { roles?: { name?: string; role_permissions?: Array<{ permissions?: { name?: string } | null }> | null } | null }).roles
          if (!role) continue
          if (role.name) roles.push(role.name)
          for (const rp of role.role_permissions || []) {
            const name = rp.permissions?.name
            if (name) permissions.add(name)
          }
        }
        if (!mounted) return
        setRoleNames(roles)
        setPermissionNames(Array.from(permissions))
      } catch (error) {
        console.error('Error loading admin permissions:', error)
        if (mounted) {
          setRoleNames([])
          setPermissionNames([])
        }
      }
    }
    void loadPermissions()
    return () => {
      mounted = false
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
      permissionNames,
      roleNames,
    }),
    [isCollapsed, handleSetCollapsed, isMobileOpen, counts, refreshCounts, permissionNames, roleNames],
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
