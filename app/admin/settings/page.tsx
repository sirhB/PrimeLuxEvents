import { requirePermission } from '@/lib/auth/authorization'
import SettingsClient from './settings-client'
import { StripeStatusCard } from '@/components/admin/settings/stripe-status-card'

export default async function SettingsPage() {
    await requirePermission('settings.view')

    return <SettingsClient stripeStatus={<StripeStatusCard />} />
}
