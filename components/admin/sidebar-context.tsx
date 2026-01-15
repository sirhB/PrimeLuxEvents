'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AdminSidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean) => void
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined)

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin-sidebar-collapsed')
        if (saved) {
            setIsCollapsed(JSON.parse(saved))
        }
    }, [])

    const handleSetCollapsed = (value: boolean) => {
        setIsCollapsed(value)
        localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
    }

    return (
        <AdminSidebarContext.Provider value={{
            isCollapsed,
            setIsCollapsed: handleSetCollapsed,
            isMobileOpen,
            setIsMobileOpen
        }}>
            {children}
        </AdminSidebarContext.Provider>
    )
}

export function useAdminSidebar() {
    const context = useContext(AdminSidebarContext)
    if (context === undefined) {
        throw new Error('useAdminSidebar must be used within an AdminSidebarProvider')
    }
    return context
}
