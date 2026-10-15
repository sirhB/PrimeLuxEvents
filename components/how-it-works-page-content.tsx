"use client"

import Link from "next/link"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EditableContent } from "@/components/admin/editable-content"

interface HowItWorksPageContentProps {
    content: any
    isEditing?: boolean
}

const PROCESS_IMAGES = [
    "/images/luxury_furniture_collection_1767781427931.png",
    "/images/luxury_selection_interface_1767781469895.png",
    "/images/mist-cedar-hero-vivid.jpg",
    "/images/service-logistics.png",
    "/images/luxury_event_setup_celebration_1767781442112.png",
]

export function HowItWorksPageContent({ content, isEditing = false }: HowItWorksPageContentProps) {
    const defaultSteps = [
        {
            title: 'Browse the collection',
            description: 'Explore furniture, décor, lighting, and packages from our Shelton showroom. Filter by category and check what fits your event.',
            details: ['Real-time catalog', 'Packages & à la carte', 'CT · RI · MA delivery'],
        },
        {
            title: 'Build your cart',
            description: 'Add pieces with quantities for your guest count. Optional add-ons appear at checkout so you can finish the look in one flow.',
            details: ['Instant line totals', 'Event date in cart', 'Easy edits'],
        },
        {
            title: 'Event & delivery details',
            description: 'Tell us venue address, delivery window, and pickup. We calculate delivery from our Shelton warehouse.',
            details: ['Venue logistics', 'Pickup scheduling', 'Transparent fees'],
        },
        {
            title: 'Sign & reserve',
            description: 'Review the rental agreement, sign digitally, and pay a deposit or full balance securely with Stripe.',
            details: ['Digital signature', 'Deposit or pay in full', 'Confirmation email'],
        },
        {
            title: 'We deliver — you celebrate',
            description: 'Our team delivers and picks up on schedule. Need the event hall or a showroom visit? Contact us anytime.',
            details: ['On-time logistics', 'Showroom at 2 Research Dr', 'Dedicated support'],
        },
    ]

    const steps = (content['howitworks.steps.list']?.length ? content['howitworks.steps.list'] : defaultSteps)
    const faqs = content['howitworks.faq.list'] || []

    return (
        <div>
            <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-28">
                <p className="lux-label">The process</p>
                <EditableContent
                    contentKey="howitworks.hero.title"
                    initialValue={content['howitworks.hero.title']}
                    isEditing={isEditing}
                    as="h1"
                    className="mt-4 font-serif text-5xl font-medium leading-[0.95] md:text-7xl"
                />
                <EditableContent
                    contentKey="howitworks.hero.description"
                    initialValue={content['howitworks.hero.description']}
                    type="textarea"
                    isEditing={isEditing}
                    as="p"
                    className="mt-5 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                />
            </section>

            <section className="border-t border-[var(--theme-dark)]/10">
                {steps.map((step: any, index: number) => (
                    <article key={step.title || index} className="border-b border-[var(--theme-dark)]/10">
                        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-16">
                            <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--theme-surface)]">
                                    <Image
                                        src={step.image || PROCESS_IMAGES[index % PROCESS_IMAGES.length]}
                                        alt=""
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="lux-label">{String(index + 1).padStart(2, '0')}</p>
                                <h2 className="mt-3 font-serif text-4xl font-medium leading-none">{step.title}</h2>
                                <p className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]">{step.description}</p>
                                {step.details?.length > 0 && (
                                    <ul className="mt-6 space-y-2 text-sm">
                                        {step.details.map((detail: string) => (
                                            <li key={detail} className="border-t border-[var(--theme-dark)]/10 py-2 font-light">{detail}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <section className="border-b border-[var(--theme-dark)]/10">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)]">
                        <Image src="/images/premium_concierge_service_1767781456386.png" alt="" fill className="object-cover" />
                    </div>
                    <div>
                        <p className="lux-label">Concierge</p>
                        <EditableContent
                            contentKey="howitworks.concierge.title"
                            initialValue={content['howitworks.concierge.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="mt-3 font-serif text-4xl font-medium leading-none md:text-5xl"
                        />
                        <EditableContent
                            contentKey="howitworks.concierge.description"
                            initialValue={content['howitworks.concierge.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                        />
                        <EditableContent
                            contentKey="howitworks.concierge.list.title"
                            initialValue={content['howitworks.concierge.list.title']}
                            isEditing={isEditing}
                            as="h3"
                            className="mt-8 font-serif text-2xl"
                        />
                        <ol className="mt-4 space-y-3">
                            {[1, 2, 3].map((num) => (
                                <li key={num} className="flex gap-4 border-t border-[var(--theme-dark)]/10 py-3">
                                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--theme-muted)]">0{num}</span>
                                    <EditableContent
                                        contentKey={`howitworks.concierge.list.item${num}`}
                                        initialValue={content[`howitworks.concierge.list.item${num}`]}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-sm font-light"
                                    />
                                </li>
                            ))}
                        </ol>
                        <Link href="/contact" className="lux-cta mt-8">
                            <EditableContent
                                contentKey="howitworks.concierge.button"
                                initialValue={content['howitworks.concierge.button']}
                                isEditing={isEditing}
                                as="span"
                            />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
                <p className="lux-label">Assistance</p>
                <EditableContent
                    contentKey="howitworks.faq.title"
                    initialValue={content['howitworks.faq.title']}
                    isEditing={isEditing}
                    as="h2"
                    className="mt-3 font-serif text-4xl font-medium leading-none md:text-6xl"
                />
                <EditableContent
                    contentKey="howitworks.faq.description"
                    initialValue={content['howitworks.faq.description']}
                    type="textarea"
                    isEditing={isEditing}
                    as="p"
                    className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                />
                <Accordion type="single" collapsible className="mt-10 border-t border-[var(--theme-dark)]/10">
                    {faqs.map((faq: any, index: number) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b border-[var(--theme-dark)]/10">
                            <AccordionTrigger className="py-5 text-left font-serif text-2xl font-medium hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 text-base font-light leading-relaxed text-[var(--theme-muted)]">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Link href="/faq" className="mt-8 inline-block text-[11px] uppercase tracking-[0.2em] underline">
                    <EditableContent
                        contentKey="howitworks.faq.button"
                        initialValue={content['howitworks.faq.button']}
                        isEditing={isEditing}
                        as="span"
                    />
                </Link>
            </section>
        </div>
    )
}
