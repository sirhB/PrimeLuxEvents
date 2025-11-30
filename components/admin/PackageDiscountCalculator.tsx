'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { PackageItemGroup } from './PackageItemGroupBuilder'

interface PackageDiscountCalculatorProps {
    groups: PackageItemGroup[]
    products: any[]
    initialPrice?: number // in cents
    initialDiscountType?: 'percentage' | 'fixed_amount'
    initialDiscountValue?: number
    onChange: (data: {
        price: number,
        discountType: 'percentage' | 'fixed_amount',
        discountValue: number,
        originalPrice: number,
        savingsAmount: number
    }) => void
}

export default function PackageDiscountCalculator({
    groups,
    products,
    initialPrice = 0,
    initialDiscountType = 'percentage',
    initialDiscountValue = 0,
    onChange
}: PackageDiscountCalculatorProps) {
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>(initialDiscountType)
    const [discountValue, setDiscountValue] = useState(initialDiscountValue)
    const [manualPrice, setManualPrice] = useState(initialPrice)

    // Calculate original price based on default selections or average of options
    const calculateOriginalPrice = () => {
        let total = 0

        groups.forEach(group => {
            if (group.options.length === 0) return

            // If there are default options, sum them up
            const defaultOptions = group.options.filter(o => o.is_default)

            if (defaultOptions.length > 0) {
                defaultOptions.forEach(opt => {
                    const product = products.find(p => p.id === opt.product_id)
                    if (product) {
                        total += product.price * opt.quantity
                    }
                })
            } else {
                // If no defaults, take the average price of options * min_selections
                // This is an estimation for display purposes
                const optionPrices = group.options.map(opt => {
                    const product = products.find(p => p.id === opt.product_id)
                    return (product?.price || 0) * opt.quantity
                })

                if (optionPrices.length > 0) {
                    const avgPrice = optionPrices.reduce((a, b) => a + b, 0) / optionPrices.length
                    total += avgPrice * group.min_selections
                }
            }
        })

        return Math.round(total)
    }

    const originalPrice = calculateOriginalPrice()

    // Calculate final price and savings
    let finalPrice = manualPrice
    let savings = 0

    if (discountType === 'percentage') {
        // If percentage discount, we calculate price based on original value
        // But usually packages have a fixed price that implies a discount
        // Let's support two modes: 
        // 1. Set Price directly (implicit discount)
        // 2. Set Discount % (calculated price)

        // For this implementation, let's stick to: User sets final price, we calculate savings
        // OR User sets discount %, we calculate final price

        // Let's go with: User sets Final Price OR Discount Amount
        savings = Math.round(originalPrice * (discountValue / 100))
        finalPrice = originalPrice - savings
    } else {
        // Fixed Amount Discount
        savings = discountValue * 100 // convert to cents
        finalPrice = originalPrice - savings
    }

    // Update parent whenever values change
    useEffect(() => {
        onChange({
            price: finalPrice,
            discountType,
            discountValue,
            originalPrice,
            savingsAmount: savings
        })
    }, [discountType, discountValue, originalPrice, finalPrice, savings])

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Estimated Value</h3>
                        <div className="text-3xl font-bold text-muted-foreground">
                            {formatCurrency(originalPrice)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Calculated based on default selections or average option prices.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gold/10 border-gold/20">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 text-gold-dark">Final Package Price</h3>
                        <div className="text-3xl font-bold text-gold-dark">
                            {formatCurrency(finalPrice)}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-green-700 font-medium">
                            <span>You save: {formatCurrency(savings)}</span>
                            <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                                {originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0}% OFF
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Label>Discount Method</Label>
                <RadioGroup
                    defaultValue={discountType}
                    onValueChange={(val: 'percentage' | 'fixed_amount') => setDiscountType(val)}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage">Percentage Off</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed_amount" id="fixed_amount" />
                        <Label htmlFor="fixed_amount">Fixed Amount Off</Label>
                    </div>
                </RadioGroup>

                <div className="max-w-xs">
                    {discountType === 'percentage' ? (
                        <div className="space-y-2">
                            <Label>Discount Percentage (%)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Discount Amount ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
