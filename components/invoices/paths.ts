'use client'

import { usePathname } from 'next/navigation'

/** Planners use /account/planner/*, staff use /admin/*. Same components, same RLS. */
export function usePlannerBase(): { invoices: string; carts: string } {
  const p = usePathname() ?? ''
  return p.startsWith('/account')
    ? { invoices: '/account/planner/invoices', carts: '/account/planner/carts' }
    : p.startsWith('/preview') ? { invoices: '/preview/invoice-editor', carts: '/preview/planner-cart' }
    : { invoices: '/admin/invoices', carts: '/admin/carts' }
}
