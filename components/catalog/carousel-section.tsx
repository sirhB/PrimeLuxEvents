'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <section className="relative py-8 md:py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <span className="text-primary text-sm font-medium tracking-widest uppercase mb-2 block">
                        Featured
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Navigation Arrows - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all duration-300"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className="h-10 w-10 rounded-full border-2 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all duration-300"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 md:gap-6">
                    {children}
                </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-2 mt-5">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === selectedIndex
                                ? "w-6 bg-gold"
                                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

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
