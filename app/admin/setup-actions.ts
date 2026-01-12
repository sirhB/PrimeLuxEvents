'use server'

import { createClient } from '@/lib/supabase/server'

export interface SetupStatus {
    businessIdentity: boolean
    inventoryVerification: boolean
    pricingRules: boolean
    portfolioShowcase: boolean
    teamBuilding: boolean
    logisticsConfig: boolean
    isComplete: boolean
    progress: number
}

export async function getSetupStatus(): Promise<SetupStatus> {
    const supabase = await createClient()

    // 1. Business Identity
    const { data: settings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['company_email', 'company_phone', 'company_address'])

    const identityKeys = settings?.filter(s => s.value && s.value.length > 5) || []
    const businessIdentity = identityKeys.length >= 3

    // 2. Inventory Verification
    const { count: unverifiedCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)

    const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    // Considered verified if we have products and none are unverified
    const inventoryVerification = totalProducts !== null && totalProducts > 0 && unverifiedCount === 0

    // 3. Pricing Rules
    const { count: discountCount } = await supabase
        .from('tiered_discounts')
        .select('*', { count: 'exact', head: true })

    const pricingRules = discountCount !== null && discountCount > 0

    // 4. Portfolio Showcase
    const { count: portfolioCount } = await supabase
        .from('portfolio_categories')
        .select('*', { count: 'exact', head: true })

    const portfolioShowcase = portfolioCount !== null && portfolioCount > 0

    // 5. Team Building
    const { count: teamCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

    const teamBuilding = teamCount !== null && teamCount > 1

    // 6. Logistics Config
    const { data: logisticsSettings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['tax_rate', 'warehouse_address'])

    const logisticsConfig = logisticsSettings?.length === 2 && logisticsSettings.every(s => s.value && s.value.length > 0)

    const steps = [
        businessIdentity,
        inventoryVerification,
        pricingRules,
        portfolioShowcase,
        teamBuilding,
        logisticsConfig
    ]

    const completedSteps = steps.filter(Boolean).length
    const progress = Math.round((completedSteps / steps.length) * 100)
    const isComplete = completedSteps === steps.length

    return {
        businessIdentity,
        inventoryVerification,
        pricingRules,
        portfolioShowcase,
        teamBuilding,
        logisticsConfig,
        isComplete,
        progress
    }
}
