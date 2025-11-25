'use client'

import { Search, X, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search products, categories..." }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        if (value) {
            setIsTyping(true)
            const timer = setTimeout(() => setIsTyping(false), 1000)
            return () => clearTimeout(timer)
        }
    }, [value])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative w-full max-w-xl mx-auto mb-12"
        >
            <motion.div
                animate={{
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused
                        ? "0 0 0 3px rgba(212, 175, 55, 0.1)"
                        : "0 0 0 0px rgba(212, 175, 55, 0)"
                }}
                transition={{ duration: 0.2 }}
                className="relative"
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {isTyping ? (
                            <motion.div
                                key="sparkles"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Sparkles className="h-5 w-5 text-gold animate-pulse" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Search className={`h-5 w-5 transition-colors duration-300 ${
                                    isFocused ? 'text-gold' : 'text-muted-foreground'
                                }`} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Input
                    type="text"
                    className="pl-10 pr-10 h-12 text-lg bg-background/50 backdrop-blur-sm border-gold/20 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => onChange('')}
                        >
                            <X className="h-4 w-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Animated background glow */}
            <motion.div
                animate={{
                    opacity: isFocused ? 0.1 : 0,
                    scale: isFocused ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-gold/20 via-transparent to-gold/20 rounded-lg blur-xl -z-10"
            />

            {/* Search suggestions indicator */}
            <AnimatePresence>
                {isFocused && !value && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg"
                    >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-gold" />
                            <span>Try "chairs", "lighting", or "tables"</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
