'use client'

import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ToggleActiveSwitch({ id, isActive }: { id: string, isActive: boolean }) {
    const router = useRouter()

    const handleToggle = async (checked: boolean) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('tiered_discounts')
            .update({ is_active: checked })
            .eq('id', id)

        if (error) {
            toast.error('Failed to update status')
        } else {
            toast.success(checked ? 'Discount activated' : 'Discount deactivated')
            router.refresh()
        }
    }

    return (
        <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[var(--dashboard-accent-gold)]"
        />
    )
}
