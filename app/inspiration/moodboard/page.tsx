"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, RefreshCw, Layers, Layout, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { aiService, MoodBoardResult } from "@/lib/ai/puter.ts"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
    "Emerald & Gold Art Deco Gala",
    "Modern Minimalist Beach Wedding",
    "Rustic Farmhouse Winter Soiree",
    "Tropical Havana Nights Corporate Event"
]

export default function MoodBoardPage() {
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<MoodBoardResult | null>(null)

    const handleGenerate = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!prompt.trim()) return

        setIsGenerating(true)
        setResult(null)

        try {
            const data = await aiService.planEvent(prompt)
            setResult(data)
        } catch (error) {
            console.error("Failed to generate mood board:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/moodboard-hero.png"
                    alt="Moodboard Hero"
                    fill
                    className="object-cover opacity-40 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]" />

                <div className="container relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge variant="outline" className="mb-4 border-gold/50 text-gold font-bold tracking-[0.2em] px-4 py-1">
                            AI POWERED DESIGN
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-tight">
                            Visualize Your <span className="text-gold italic">Dream</span> Event
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                            Describe your vision in a few words, and our AI will curate a bespoke mood board and matching rental collections just for you.
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        onSubmit={handleGenerate}
                        className="mt-12 max-w-3xl mx-auto relative group"
                    >
                        <div className="relative flex items-center">
                            <Input
                                placeholder="e.g. A mid-century modern garden party with copper accents..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="h-16 pl-6 pr-32 bg-white/5 border-white/10 backdrop-blur-xl rounded-full text-lg focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-white/20"
                            />
                            <Button
                                type="submit"
                                disabled={isGenerating || !prompt.trim()}
                                className="absolute right-2 h-12 px-8 rounded-full bg-gold hover:bg-white text-black font-bold transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Design
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setPrompt(s)}
                                    className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-gold transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.form>
                </div>
            </section>

            {/* Results Section */}
            <section className="container px-4 mx-auto">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
                                    <Skeleton className="h-6 w-3/4 bg-white/5" />
                                    <Skeleton className="h-4 w-1/2 bg-white/5" />
                                </div>
                            ))}
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-16"
                        >
                            {/* Summary Card */}
                            <div className="max-w-4xl mx-auto text-center space-y-6">
                                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gold/10 text-gold mb-4">
                                    <Send className="h-6 w-6" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight">
                                    Design <span className="text-gold italic">Vision</span>
                                </h2>
                                <p className="text-xl text-gray-400 font-light leading-relaxed italic">
                                    "{result.summary}"
                                </p>
                            </div>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {result.images.map((img, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn(
                                            "relative group overflow-hidden rounded-3xl aspect-[4/5] border border-white/5",
                                            idx === 0 && "md:col-span-1 md:row-span-2"
                                        )}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="outline" className="rounded-full bg-white/10 backdrop-blur-md border-white/20">
                                                <Camera className="h-4 w-4 mr-2" />
                                                View Visual
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Recommendations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/5">
                                {result.recommendations.map((rec, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                    >
                                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-gold/50 transition-all group h-full">
                                            <CardContent className="p-8 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary" className="bg-gold/10 text-gold border-none font-bold uppercase tracking-widest text-[10px]">
                                                        {rec.category}
                                                    </Badge>
                                                    <Layers className="h-4 w-4 text-white/20 group-hover:text-gold transition-colors" />
                                                </div>
                                                <h3 className="text-lg font-serif font-light text-white group-hover:text-gold transition-colors">
                                                    {rec.category} Recommendation
                                                </h3>
                                                <p className="text-sm text-gray-500 font-light leading-relaxed">
                                                    {rec.reason}
                                                </p>
                                                <Button variant="link" className="p-0 text-gold text-xs h-auto hover:text-white transition-colors uppercase tracking-[0.2em] font-bold">
                                                    Browse Collection →
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center pt-8">
                                <Button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    variant="outline"
                                    className="rounded-full border-white/10 text-white/40 hover:text-gold"
                                >
                                    <Layout className="h-4 w-4 mr-2" />
                                    Try Another Concept
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 px-4"
                        >
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                    <Sparkles className="h-8 w-8 text-gold/30" />
                                </div>
                                <h3 className="text-xl font-serif text-white/60">Ready to inspire?</h3>
                                <p className="text-sm text-white/30 font-light italic">
                                    "Architecture is the learned game, correct and magnificent, of forms assembled in the light."
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    )
}
