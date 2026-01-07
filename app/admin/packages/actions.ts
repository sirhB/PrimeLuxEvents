'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type PackageData = {
    name: string
    description: string
    price: number
    image_url: string
    is_featured: boolean
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    original_price: number
    savings_amount: number
}

export type ItemGroupData = {
    id?: string
    name: string
    description: string
    min_selections: number
    max_selections: number
    display_order: number
    options: {
        id?: string
        product_id: string
        is_default: boolean
        quantity: number
    }[]
}

export type StaticItemData = {
    id?: string
    product_id: string
    quantity: number
}

export async function createPackageWithItems(
    packageData: PackageData,
    groups: ItemGroupData[],
    staticItems: StaticItemData[] = []
) {
    const supabase = await createClient()

    // 1. Create Package
    const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single()

    if (pkgError) {
        console.error('Error creating package:', pkgError)
        throw new Error('Failed to create package')
    }

    // 2. Create Groups and Options
    for (const group of groups) {
        const { data: newGroup, error: groupError } = await supabase
            .from('package_item_groups')
            .insert({
                package_id: pkg.id,
                name: group.name,
                description: group.description,
                min_selections: group.min_selections,
                max_selections: group.max_selections,
                display_order: group.display_order
            })
            .select()
            .single()

        if (groupError) {
            console.error('Error creating group:', groupError)
            continue
        }

        if (group.options.length > 0) {
            const optionsToInsert = group.options.map((opt, idx) => ({
                group_id: newGroup.id,
                product_id: opt.product_id,
                is_default: opt.is_default,
                quantity: opt.quantity,
                display_order: idx
            }))

            const { error: optionsError } = await supabase
                .from('package_item_options')
                .insert(optionsToInsert)

            if (optionsError) {
                console.error('Error creating options:', optionsError)
            }
        }
    }

    // 3. Create Static Items
    if (staticItems.length > 0) {
        const itemsToInsert = staticItems.map(item => ({
            package_id: pkg.id,
            product_id: item.product_id,
            quantity: item.quantity
        }))

        const { error: itemsError } = await supabase
            .from('package_items')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating static items:', itemsError)
        }
    }

    revalidatePath('/admin/packages')
    return { success: true, packageId: pkg.id }
}

export async function updatePackageWithItems(
    packageId: string,
    packageData: PackageData,
    groups: ItemGroupData[],
    staticItems: StaticItemData[] = []
) {
    const supabase = await createClient()

    // 1. Update Package
    const { error: pkgError } = await supabase
        .from('packages')
        .update(packageData)
        .eq('id', packageId)

    if (pkgError) {
        console.error('Error updating package:', pkgError)
        throw new Error('Failed to update package')
    }

    // 2. Handle Groups (Delete and Recreate)
    const { error: deleteGroupsError } = await supabase
        .from('package_item_groups')
        .delete()
        .eq('package_id', packageId)

    if (deleteGroupsError) {
        console.error('Error clearing old groups:', deleteGroupsError)
        throw new Error('Failed to update package items')
    }

    // Re-create groups and options
    for (const group of groups) {
        const { data: newGroup, error: groupError } = await supabase
            .from('package_item_groups')
            .insert({
                package_id: packageId,
                name: group.name,
                description: group.description,
                min_selections: group.min_selections,
                max_selections: group.max_selections,
                display_order: group.display_order
            })
            .select()
            .single()

        if (groupError) {
            console.error('Error creating group:', groupError)
            continue
        }

        if (group.options.length > 0) {
            const optionsToInsert = group.options.map((opt, idx) => ({
                group_id: newGroup.id,
                product_id: opt.product_id,
                is_default: opt.is_default,
                quantity: opt.quantity,
                display_order: idx
            }))

            const { error: optionsError } = await supabase
                .from('package_item_options')
                .insert(optionsToInsert)

            if (optionsError) {
                console.error('Error creating options:', optionsError)
            }
        }
    }

    // 3. Handle Static Items (Delete and Recreate)
    const { error: deleteItemsError } = await supabase
        .from('package_items')
        .delete()
        .eq('package_id', packageId)

    if (deleteItemsError) {
        console.error('Error clearing old static items:', deleteItemsError)
    }

    if (staticItems.length > 0) {
        const itemsToInsert = staticItems.map(item => ({
            package_id: packageId,
            product_id: item.product_id,
            quantity: item.quantity
        }))

        const { error: itemsError } = await supabase
            .from('package_items')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating static items:', itemsError)
        }
    }

    revalidatePath('/admin/packages')
    revalidatePath(`/admin/packages/${packageId}`)
    return { success: true }
}

export async function deletePackage(id: string) {
    const supabase = await createClient()
    await supabase.from('packages').delete().eq('id', id)
    revalidatePath('/admin/packages')
}
