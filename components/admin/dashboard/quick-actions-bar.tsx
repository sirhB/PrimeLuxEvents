'use client'

import { Search, Plus, Bell, FileText, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

export function QuickActionsBar() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 border border-border/40 rounded-xl p-6 transition-all duration-500 hover:shadow-xl"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search events, guests, or invoices..."
                        className="pl-12 bg-secondary/30 border-border/40 focus:border-gold/50 rounded-lg h-12 transition-all duration-300 placeholder:text-muted-foreground/70"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="group border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300 shadow-lg hover:shadow-gold/10 h-12 px-6 rounded-lg">
                            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">New Event</span>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="h-14 px-6 rounded-full border-border/50 hover:border-gold hover:bg-gold/5 hover:text-gold transition-all duration-300 shadow-lg hover:shadow-gold/10">
                            <Package className="h-5 w-5 mr-2" />
                            <span className="font-medium">Add Product</span>
                        </Button>
                    </motion.div>

                    <div className="h-8 w-px bg-border/50 mx-4" />

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors shadow-sm hover:shadow-gold/20">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                        </Button>
                    </motion.div>

                    <div className="flex items-center gap-4 pl-4 border-l border-border/50 ml-4">
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya"
                                alt="Maya Brooks"
                                className="h-10 w-10 rounded-full border-2 border-white shadow-lg ring-2 ring-gold/20 hover:ring-gold/40 transition-all duration-300"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
