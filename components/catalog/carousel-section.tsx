'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CarouselSectionProps {
    title: string
    subtitle?: string
    children: ReactNode
    autoPlay?: boolean
    autoPlayInterval?: number
}

export function CarouselSection({
    title,
    subtitle,
    children,
    autoPlay = false,
    autoPlayInterval = 5000
}: CarouselSectionProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        skipSnaps: false,
        dragFree: false,
    })

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index)
    }, [emblaApi])

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
        setPrevBtnEnabled(emblaApi.canScrollPrev())
        setNextBtnEnabled(emblaApi.canScrollNext())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        setScrollSnaps(emblaApi.scrollSnapList())
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)

        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }
    }, [emblaApi, onSelect])

    // Auto-play functionality
    useEffect(() => {
        if (!emblaApi || !autoPlay) return

        const interval = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext()
            } else {
                emblaApi.scrollTo(0)
            }
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [emblaApi, autoPlay, autoPlayInterval])

    return (
        <section className="relative">
            {/* Header */}
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Enhanced Navigation Arrows - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all duration-300 relative overflow-hidden group"
                        >
                            <motion.div
                                whileHover={{ x: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gold/10 rounded-full"
                            />
                        </Button>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all duration-300 relative overflow-hidden group"
                        >
                            <motion.div
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gold/10 rounded-full"
                            />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 md:gap-6">
                    {children}
                </div>
            </div>

            {/* Enhanced Dot Indicators */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-5"
            >
                {scrollSnaps.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            index === selectedIndex
                                ? "w-6 h-1.5 bg-gold"
                                : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        whileHover={{
                            scale: index === selectedIndex ? 1.1 : 1.2,
                            backgroundColor: index === selectedIndex ? "#D4AF37" : "rgba(0,0,0,0.3)"
                        }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            width: index === selectedIndex ? 24 : 6,
                            backgroundColor: index === selectedIndex ? "#D4AF37" : "rgba(0,0,0,0.2)"
                        }}
                        transition={{ duration: 0.3 }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </motion.div>

            {/* Mobile Navigation Arrows */}
            <div className="flex md:hidden items-center justify-center gap-4 mt-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                    className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    disabled={!nextBtnEnabled}
                    className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </section>
    )
}
