export const WAREHOUSE_CATEGORIES = [
    'pick',
    'pack',
    'put_away',
    'vehicle_load',
    'inventory_maintenance',
    'returns_checkin',
    'location_audit',
    'general',
] as const

export type WarehouseCategory = (typeof WAREHOUSE_CATEGORIES)[number]

export interface ChecklistItem {
    id: string
    label: string
    product_id?: string
    bag_id?: string
    qty?: number
    completed: boolean
    completed_at?: string
    completed_by?: string
}

export interface WarehouseTask {
    id: string
    title: string
    description?: string | null
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    task_type: string
    warehouse_category?: WarehouseCategory | null
    order_id?: string | null
    assigned_to?: string | null
    assigned_role_id?: string | null
    assigned_to_text?: string | null
    due_date?: string | null
    due_time?: string | null
    scheduled_start?: string | null
    estimated_minutes?: number | null
    checklist?: ChecklistItem[]
    parent_task_id?: string | null
    completion_notes?: string | null
    completion_image_url?: string | null
    meta_data?: Record<string, unknown>
    orders?: {
        id: string
        customer_name: string
        delivery_address?: string | null
        delivery_time?: string | null
        delivery_date?: string | null
    } | null
}

export const WAREHOUSE_CATEGORY_LABELS: Record<WarehouseCategory, string> = {
    pick: 'Pick Items',
    pack: 'Pack into Bags',
    put_away: 'Put Away',
    vehicle_load: 'Stage for Loading',
    inventory_maintenance: 'Inventory Maintenance',
    returns_checkin: 'Returns Check-in',
    location_audit: 'Location Audit',
    general: 'General',
}

export const WAREHOUSE_CATEGORY_ORDER: WarehouseCategory[] = [
    'pick',
    'pack',
    'vehicle_load',
    'put_away',
    'inventory_maintenance',
    'returns_checkin',
    'location_audit',
    'general',
]
