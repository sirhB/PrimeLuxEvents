'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { SearchModal } from '@/components/search-modal'

export function AdminSearchFab() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="fixed bottom-24 right-8 z-50 h-14 w-14 rounded-full bg-[var(--dashboard-accent-gold)] text-white shadow-lg flex items-center justify-center hover:bg-yellow-600 transition-colors md:hidden"
            >
                <Search className="h-6 w-6" />
            </motion.button>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}
