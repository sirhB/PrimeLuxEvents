"use client"

import { motion } from "framer-motion"
import { FileText, Shield, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useState } from "react"

interface RentalAgreementPageContentProps {
    content: any
    isEditing?: boolean
}

export function RentalAgreementPageContent({ content, isEditing = false }: RentalAgreementPageContentProps) {
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    const rentalAgreementData = content['rental_agreement'] || {
        title: "PrimeLux Events | Rental Agreement",
        effective_date: "November 2025",
        introduction: "This Contract is executed between PrimeLux Events (the \"Company\") and the Renter. Acceptance of the rental order binds the Renter to the entirety of these terms.",
        sections: []
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('content')
                .upsert({
                    key: 'rental_agreement',
                    value: rentalAgreementData,
                    type: 'json'
                })

            if (error) {
                toast.error("Failed to save rental agreement")
                console.error('Save error:', error)
            } else {
                toast.success("Rental agreement saved successfully")
            }
        } catch (error) {
            toast.error("Failed to save rental agreement")
            console.error('Save error:', error)
        }
        setIsSaving(false)
    }

    const updateField = (field: string, value: any) => {
        rentalAgreementData[field] = value
        // Force re-render
        window.location.reload()
    }

    const updateSection = (index: number, field: string, value: any) => {
        rentalAgreementData.sections[index][field] = value
        // Force re-render
        window.location.reload()
    }

    const updateStipulation = (sectionIndex: number, stipulationIndex: number, field: string, value: string) => {
        rentalAgreementData.sections[sectionIndex].stipulations[stipulationIndex][field] = value
        // Force re-render
        window.location.reload()
    }

    const updateProtocol = (protocolIndex: number, field: string, value: string) => {
        const protocolsSection = rentalAgreementData.sections.find((s: any) => s.roman_numeral === "IV")
        if (protocolsSection && protocolsSection.protocols) {
            protocolsSection.protocols[protocolIndex][field] = value
            // Force re-render
            window.location.reload()
        }
    }

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
                        >
                            <FileText className="h-4 w-4" />
                            {isEditing ? (
                                <Input
                                    value="Rental Agreement"
                                    onChange={(e) => updateField('badge', e.target.value)}
                                    className="w-32 h-4 text-xs bg-transparent border-none p-0 text-gold"
                                />
                            ) : (
                                "Rental Agreement"
                            )}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6"
                        >
                            {isEditing ? (
                                <Input
                                    value={rentalAgreementData.title.replace("PrimeLux Events | ", "")}
                                    onChange={(e) => updateField('title', "PrimeLux Events | " + e.target.value)}
                                    className="w-full text-center bg-transparent border-none p-0 text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground"
                                />
                            ) : (
                                rentalAgreementData.title.replace("PrimeLux Events | ", "")
                            )}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto mb-12"
                        >
                            {isEditing ? (
                                <Textarea
                                    value={rentalAgreementData.introduction}
                                    onChange={(e) => updateField('introduction', e.target.value)}
                                    className="w-full text-center bg-transparent border-none p-0 text-xl md:text-2xl text-muted-foreground font-light leading-relaxed resize-none"
                                    rows={3}
                                />
                            ) : (
                                rentalAgreementData.introduction
                            )}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 1 }}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Effective Date: </span>
                                {isEditing ? (
                                    <Input
                                        value={rentalAgreementData.effective_date}
                                        onChange={(e) => updateField('effective_date', e.target.value)}
                                        className="w-24 h-4 text-xs bg-transparent border-none p-0 text-muted-foreground"
                                    />
                                ) : (
                                    rentalAgreementData.effective_date
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="prose prose-lg max-w-none"
                    >
                        <div className="space-y-12">
                            {rentalAgreementData.sections?.map((section: any, sectionIndex: number) => (
                                <div key={section.roman_numeral} className="bg-background/50 p-8 rounded-xl border border-border/40">
                                    <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">
                                        <span className="text-gold font-bold">{section.roman_numeral}.</span>{' '}
                                        {isEditing ? (
                                            <Input
                                                value={section.title}
                                                onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-2xl font-serif text-foreground"
                                            />
                                        ) : (
                                            section.title
                                        )}
                                    </h2>

                                    {section.stipulations && (
                                        <div className="space-y-6">
                                            {section.stipulations.map((stipulation: any, stipulationIndex: number) => (
                                                <div key={stipulationIndex} className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-gold">
                                                            {isEditing ? (
                                                                <Input
                                                                    value={stipulation.area}
                                                                    onChange={(e) => updateStipulation(sectionIndex, stipulationIndex, 'area', e.target.value)}
                                                                    className="w-full bg-transparent border-none p-0 font-semibold text-gold"
                                                                />
                                                            ) : (
                                                                stipulation.area
                                                            )}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm">
                                                            {isEditing ? (
                                                                <Textarea
                                                                    value={stipulation.description}
                                                                    onChange={(e) => updateStipulation(sectionIndex, stipulationIndex, 'description', e.target.value)}
                                                                    className="w-full bg-transparent border-none p-0 text-muted-foreground text-sm resize-none"
                                                                    rows={3}
                                                                />
                                                            ) : (
                                                                stipulation.description
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.description && (
                                        <p className="text-muted-foreground leading-relaxed">
                                            {isEditing ? (
                                                <Textarea
                                                    value={section.description}
                                                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-muted-foreground leading-relaxed resize-none"
                                                    rows={4}
                                                />
                                            ) : (
                                                section.description
                                            )}
                                        </p>
                                    )}

                                    {section.protocols && (
                                        <div className="mt-4 space-y-3">
                                            {section.protocols.map((protocol: any, protocolIndex: number) => (
                                                <div key={protocolIndex} className="space-y-2">
                                                    <h3 className="font-semibold text-gold">
                                                        {isEditing ? (
                                                            <Input
                                                                value={protocol.category}
                                                                onChange={(e) => updateProtocol(protocolIndex, 'category', e.target.value)}
                                                                className="w-full bg-transparent border-none p-0 font-semibold text-gold"
                                                            />
                                                        ) : (
                                                            protocol.category
                                                        )}:
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        {isEditing ? (
                                                            <Textarea
                                                                value={protocol.instruction}
                                                                onChange={(e) => updateProtocol(protocolIndex, 'instruction', e.target.value)}
                                                                className="w-full bg-transparent border-none p-0 text-muted-foreground text-sm resize-none"
                                                                rows={2}
                                                            />
                                                        ) : (
                                                            protocol.instruction
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Important Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="bg-gold/5 p-8 rounded-xl border border-gold/20"
                            >
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="h-6 w-6 text-gold mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-serif mb-3 text-foreground">Important Notice</h3>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            By proceeding with your rental order, you acknowledge that you have read, understood, and agree to
                                            be bound by all terms and conditions outlined in this agreement. If you have any questions
                                            about these terms, please contact us before placing your order.
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            This agreement constitutes the entire understanding between the parties and supersedes all
                                            prior agreements, whether written or oral, relating to the subject matter hereof.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                className="text-center pt-8"
                            >
                                <h3 className="text-xl font-serif mb-4 text-foreground">Questions About This Agreement?</h3>
                                <p className="text-muted-foreground mb-6">
                                    Contact our team if you need clarification on any terms or conditions.
                                </p>
                                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300">
                                    <Link href="/contact">
                                        Contact Support
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {isEditing && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gold hover:bg-gold/90 text-black font-medium px-6 py-2 rounded-full shadow-lg"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            )}
        </>
    )
}
