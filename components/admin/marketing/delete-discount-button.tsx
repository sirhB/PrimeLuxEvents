'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DeleteDiscountButton({ id }: { id: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this discount tier?')) return

        const supabase = createClient()
        const { error } = await supabase
            .from('tiered_discounts')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete discount')
        } else {
            toast.success('Discount deleted')
            router.refresh()
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
