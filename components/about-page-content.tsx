"use client"

import Image from "next/image"
import Link from "next/link"
import { EditableContent } from "@/components/admin/editable-content"

interface AboutPageContentProps {
    content: any
    isEditing?: boolean
}

export function AboutPageContent({ content, isEditing = false }: AboutPageContentProps) {
    const values = content['about.values.items'] || []

    return (
        <div>
            <section className="mx-auto grid max-w-6xl items-end gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-28">
                <div className="md:col-span-7">
                    <p className="lux-label">About</p>
                    <EditableContent
                        contentKey="about.hero.title"
                        initialValue={content['about.hero.title']}
                        isEditing={isEditing}
                        as="h1"
                        className="mt-4 font-serif text-5xl font-medium leading-[0.95] text-[var(--theme-dark)] md:text-7xl"
                    />
                    <EditableContent
                        contentKey="about.hero.description"
                        initialValue={content['about.hero.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as="p"
                        className="mt-6 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)] md:text-lg"
                    />
                </div>
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)] md:col-span-5">
                    <EditableContent
                        contentKey="about.hero.image"
                        initialValue={content['about.hero.image'] || "/images/about-hero.png"}
                        type="image"
                        isEditing={isEditing}
                        as={Image}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </section>

            <section className="border-y border-[var(--theme-dark)]/10">
                <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)]">
                        <EditableContent
                            contentKey="about.story.image"
                            initialValue={content['about.story.image'] || "/images/luxury_event_founders_story_1767782287028.png"}
                            type="image"
                            isEditing={isEditing}
                            as={Image}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="lux-label">The house</p>
                        <EditableContent
                            contentKey="about.story.title"
                            initialValue={content['about.story.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="mt-3 font-serif text-4xl font-medium leading-none md:text-6xl"
                        />
                        <EditableContent
                            contentKey="about.story.p1"
                            initialValue={content['about.story.p1']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="mt-6 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                        />
                        <EditableContent
                            contentKey="about.story.p2"
                            initialValue={content['about.story.p2']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                        />
                        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--theme-dark)]/10 pt-6">
                            <div>
                                <dt className="font-serif text-3xl">15+</dt>
                                <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--theme-muted)]">Years</dd>
                            </div>
                            <div>
                                <dt className="font-serif text-3xl">2.5k</dt>
                                <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--theme-muted)]">Events</dd>
                            </div>
                            <div>
                                <dt className="font-serif text-3xl">One</dt>
                                <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--theme-muted)]">House</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
                <p className="lux-label">How we work</p>
                <EditableContent
                    contentKey="about.values.title"
                    initialValue={content['about.values.title']}
                    isEditing={isEditing}
                    as="h2"
                    className="mt-3 max-w-xl font-serif text-4xl font-medium leading-none md:text-6xl"
                />
                <EditableContent
                    contentKey="about.values.description"
                    initialValue={content['about.values.description']}
                    type="textarea"
                    isEditing={isEditing}
                    as="p"
                    className="mt-5 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)]"
                />
                <div className="mt-12 grid gap-px bg-[var(--theme-dark)]/10 md:grid-cols-3">
                    {values.map((value: any, index: number) => (
                        <article key={index} className="bg-[var(--suite-paper)] p-8">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">
                                {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-4 font-serif text-3xl font-medium">{value.title}</h3>
                            <p className="mt-3 text-sm font-light leading-relaxed text-[var(--theme-muted)]">{value.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-t border-[var(--theme-dark)]/10">
                <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
                    <EditableContent
                        contentKey="about.cta.title"
                        initialValue={content['about.cta.title']}
                        isEditing={isEditing}
                        as="h2"
                        className="font-serif text-4xl font-medium leading-none md:text-6xl"
                    />
                    <EditableContent
                        contentKey="about.cta.description"
                        initialValue={content['about.cta.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as="p"
                        className="mx-auto mt-5 max-w-lg text-base font-light leading-relaxed text-[var(--theme-muted)]"
                    />
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href="/plan" className="lux-cta">Plan your event</Link>
                        <Link href="/contact" className="lux-cta-ghost">Request a visit</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
