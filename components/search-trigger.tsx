"use client"

import { Search } from "lucide-react"
import { motion } from "framer-motion"

interface SearchTriggerProps {
    onClick: () => void
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
    return (
        <motion.button
            layoutId="search-container"
            onClick={onClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gold text-white hover:bg-gold/90 transition-colors shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Search className="w-5 h-5" />
            <span className="sr-only">Open Search</span>
        </motion.button>
    )
}
