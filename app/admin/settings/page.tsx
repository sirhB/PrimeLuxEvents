import { requirePermission } from '@/lib/auth/authorization'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
    await requirePermission('settings.view')

    return <SettingsClient />
}
