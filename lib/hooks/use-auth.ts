'use client'

import { useEffect, useState } from 'react'
import { UserProfile, hasPermission, hasRole, canPerformAction } from '@/lib/auth/authorization'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        // Fetch user data from API route
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasPermission: (permissionName: string) => hasPermission(permissionName),
    hasRole: (roleName: string) => hasRole(roleName),
    canPerformAction: (resource: string, action: string) => canPerformAction(resource, action)
  }
}

// Hook for checking specific permissions
export function usePermission(permissionName: string) {
  const [hasPerm, setHasPerm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkPermission() {
      try {
        const result = await hasPermission(permissionName)
        setHasPerm(result)
      } catch (error) {
        setHasPerm(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermission()
  }, [permissionName])

  return { hasPermission: hasPerm, loading }
}

// Hook for checking specific roles
export function useRole(roleName: string) {
  const [hasRoleCheck, setHasRoleCheck] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkRole() {
      try {
        const result = await hasRole(roleName)
        setHasRoleCheck(result)
      } catch (error) {
        setHasRoleCheck(false)
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [roleName])

  return { hasRole: hasRoleCheck, loading }
}

// Hook for checking resource actions
export function useResourcePermission(resource: string, action: string) {
  const [canPerform, setCanPerform] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAction() {
      try {
        const result = await canPerformAction(resource, action)
        setCanPerform(result)
      } catch (error) {
        setCanPerform(false)
      } finally {
        setLoading(false)
      }
    }

    checkAction()
  }, [resource, action])

  return { canPerformAction: canPerform, loading }
}
