"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AppLoadingScreen() {
    const [isVisible, setIsVisible] = useState(true)

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0a0b] text-white"
        >
            <div className="relative flex flex-col items-center">
                {/* Logo or Brand Element Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t border-gold opacity-50"
                        />
                        <span className="font-serif text-3xl text-gold">P</span>
                    </div>
                </motion.div>

                {/* Text Animation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col items-center space-y-2"
                >
                    <h1 className="text-xl font-medium tracking-[0.2em] font-serif">PRIMELUX</h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Events Admin</p>
                </motion.div>

                {/* Loading Indicator */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                    className="h-[1px] bg-gold/50 mt-12"
                />
            </div>
        </motion.div>
    )
}
