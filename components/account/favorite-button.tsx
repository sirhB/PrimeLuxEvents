'use client'

import { useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/app/account/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  productId: string
  initialFavorited?: boolean
  className?: string
  size?: 'sm' | 'default' | 'icon'
}

export function FavoriteButton({
  productId,
  initialFavorited = false,
  className,
  size = 'icon',
}: FavoriteButtonProps) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleFavorite(productId)
      if (!result.success) {
        if (result.error === 'Sign in required') {
          router.push('/login?next=/account/favorites')
          return
        }
        toast.error(result.error || 'Could not update favorites')
        return
      }
      toast.success(result.favorited ? 'Saved to favorites' : 'Removed from favorites')
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      disabled={pending}
      onClick={onClick}
      className={cn(
        'rounded-full bg-white/90 shadow-sm backdrop-blur hover:bg-white',
        className,
      )}
      aria-label={initialFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          initialFavorited ? 'fill-[var(--champagne,#B8956B)] text-[var(--champagne,#B8956B)]' : 'text-muted-foreground',
        )}
      />
    </Button>
  )
}
