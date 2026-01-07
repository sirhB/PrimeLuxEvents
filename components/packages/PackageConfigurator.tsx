'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Check, ChevronRight, ShoppingBag, Info, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/providers/cart-provider'

// Types (should match what we fetch)
type Product = {
    id: string
    name: string
    price: number
    image_url: string
}

type Option = {
    id: string
    product_id: string
    is_default: boolean
    quantity: number
    product: Product
}

type Group = {
    id: string
    name: string
    description: string
    min_selections: number
    max_selections: number
    display_order: number
    options: Option[]
}

type Package = {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    original_price: number
    savings_amount: number
    groups: Group[]
}

interface PackageConfiguratorProps {
    pkg: Package
}

export default function PackageConfigurator({ pkg }: PackageConfiguratorProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [selections, setSelections] = useState<Record<string, string[]>>({}) // group_id -> [option_ids]
    const { addPackageItem } = useCart()

    // Initialize default selections
    useEffect(() => {
        const defaults: Record<string, string[]> = {}
        pkg.groups.forEach(group => {
            const defaultOptions = group.options.filter(o => o.is_default).map(o => o.id)
            if (defaultOptions.length > 0) {
                defaults[group.id] = defaultOptions
            }
        })
        setSelections(defaults)
    }, [pkg.groups])

    const handleSelect = (groupId: string, optionId: string, maxSelections: number) => {
        setSelections(prev => {
            const current = prev[groupId] || []
            const isSelected = current.includes(optionId)

            if (isSelected) {
                // Deselect
                return { ...prev, [groupId]: current.filter(id => id !== optionId) }
            } else {
                // Select
                if (maxSelections === 1) {
                    // Single selection mode: replace
                    return { ...prev, [groupId]: [optionId] }
                } else {
                    // Multi selection mode: add if under limit
                    if (current.length < maxSelections) {
                        return { ...prev, [groupId]: [...current, optionId] }
                    } else {
                        toast.error(`You can only select up to ${maxSelections} items in this group.`)
                        return prev
                    }
                }
            }
        })
    }

    const currentGroup = pkg.groups[currentStep]
    const isLastStep = currentStep === pkg.groups.length - 1

    // Validation for current step
    const currentSelections = selections[currentGroup?.id] || []
    const isValidStep = currentGroup ?
        currentSelections.length >= currentGroup.min_selections &&
        currentSelections.length <= currentGroup.max_selections : true

    const nextStep = () => {
        if (isValidStep) {
            setCurrentStep(prev => Math.min(prev + 1, pkg.groups.length - 1))
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            toast.error(`Please select at least ${currentGroup.min_selections} item(s).`)
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleAddToQuote = () => {
        // Prepare selection data
        const packageSelections: Record<string, string[]> = {}
        Object.entries(selections).forEach(([groupId, optionIds]) => {
            if (optionIds.length > 0) {
                packageSelections[groupId] = optionIds
            }
        })

        // Generate summary of selections for display
        const selectionsSummary = Object.entries(selections).map(([groupId, optionIds]) => {
            const group = pkg.groups.find(g => g.id === groupId)
            const selectedOptions = optionIds.map(optId => {
                const opt = group?.options.find(o => o.id === optId)
                return {
                    name: opt?.product.name || 'Unknown Item',
                    quantity: opt?.quantity || 1
                }
            })
            return {
                groupName: group?.name || 'Category',
                items: selectedOptions
            }
        })

        addPackageItem(
            pkg.id,
            packageSelections,
            {
                name: pkg.name,
                price: pkg.price,
                original_price: pkg.original_price,
                savings_amount: pkg.savings_amount,
                selectionsSummary
            }
        )

        toast.success(`'${pkg.name}' added to your cart!`)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Left Column: Configuration Steps */}
            <div className="lg:col-span-2 space-y-8">
                {/* Progress Bar */}
                <div className="bg-secondary/30 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / pkg.groups.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Step {currentStep + 1} of {pkg.groups.length}</span>
                    <span>{currentGroup?.name}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentGroup?.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-3xl font-serif">{currentGroup?.name}</h2>
                            <p className="text-muted-foreground">{currentGroup?.description}</p>
                            <div className="text-sm font-medium text-gold-dark">
                                Select {currentGroup?.min_selections} {currentGroup?.min_selections !== currentGroup?.max_selections && `- ${currentGroup?.max_selections}`} item(s)
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentGroup?.options.map((option) => {
                                const isSelected = (selections[currentGroup.id] || []).includes(option.id)
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelect(currentGroup.id, option.id, currentGroup.max_selections)}
                                        className={cn(
                                            "cursor-pointer group relative rounded-xl border-2 overflow-hidden transition-all duration-300",
                                            isSelected
                                                ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                                                : "border-transparent bg-white hover:border-gold/30 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex h-full">
                                            <div className="relative w-32 h-full min-h-[120px] bg-secondary">
                                                {option.product.image_url ? (
                                                    <Image
                                                        src={option.product.image_url}
                                                        alt={option.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                                )}
                                            </div>
                                            <div className="flex-1 p-4 flex flex-col justify-center">
                                                <h4 className="font-medium mb-1">{option.product.name}</h4>
                                                <div className="text-sm text-muted-foreground">
                                                    Qty included: {option.quantity}
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-gold text-white rounded-full p-1">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between pt-8 border-t border-border/40">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="w-32"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    {isLastStep ? (
                        <Button
                            onClick={handleAddToQuote}
                            disabled={!isValidStep}
                            className="bg-gold hover:bg-gold/90 text-black w-40"
                        >
                            Add to Cart
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            disabled={!isValidStep}
                            className="bg-black text-white hover:bg-black/90 w-32"
                        >
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Column: Summary Sticky */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <Card className="p-6 border-gold/20 bg-white/80 backdrop-blur-sm shadow-xl">
                        <h3 className="font-serif text-xl mb-4">Package Summary</h3>

                        <div className="space-y-4 mb-6">
                            {pkg.groups.map((group, idx) => {
                                const groupSelections = selections[group.id] || []
                                if (groupSelections.length === 0) return null

                                return (
                                    <div key={group.id} className="text-sm">
                                        <div className="font-medium text-muted-foreground mb-1">{group.name}</div>
                                        <ul className="space-y-1 pl-2 border-l-2 border-gold/30">
                                            {groupSelections.map(optId => {
                                                const opt = group.options.find(o => o.id === optId)
                                                return opt ? (
                                                    <li key={optId} className="flex justify-between">
                                                        <span>{opt.product.name}</span>
                                                        <span className="text-muted-foreground">x{opt.quantity}</span>
                                                    </li>
                                                ) : null
                                            })}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Package Value</span>
                                <span className="line-through">{formatCurrency(pkg.original_price)}</span>
                            </div>
                            <div className="flex justify-between text-green-700 font-medium">
                                <span>Your Savings</span>
                                <span>-{formatCurrency(pkg.savings_amount)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-serif text-gold-dark pt-2">
                                <span>Total</span>
                                <span>{formatCurrency(pkg.price)}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleAddToQuote}
                            className="w-full mt-6 bg-gold hover:bg-gold/90 text-black h-12 text-lg"
                            disabled={!isLastStep || !isValidStep}
                        >
                            Add to Cart
                        </Button>

                        {!isLastStep && (
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                Complete all steps to add to cart
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
