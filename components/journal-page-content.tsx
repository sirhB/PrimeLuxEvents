"use client"

import Image from "next/image"
import Link from "next/link"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"

interface JournalPageContentProps {
    content: any
    isEditing?: boolean
}

export function JournalPageContent({ content, isEditing = false }: JournalPageContentProps) {
    const posts = content['journal.posts'] || []

    return (
        <div>
            <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-28">
                <p className="lux-label">Journal</p>
                <EditableContent
                    contentKey="journal.hero.title"
                    initialValue={content['journal.hero.title']}
                    isEditing={isEditing}
                    as="h1"
                    className="mt-4 font-serif text-5xl font-medium leading-[0.95] md:text-7xl"
                />
                <EditableContent
                    contentKey="journal.hero.description"
                    initialValue={content['journal.hero.description']}
                    type="textarea"
                    isEditing={isEditing}
                    as="p"
                    className="mt-5 text-base font-light leading-relaxed text-[var(--theme-muted)]"
                />
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
                <EditableList
                    contentKey="journal.posts"
                    items={posts}
                    isEditing={isEditing}
                    itemSchema={{
                        title: { type: 'text', label: 'Title', placeholder: 'Post Title' },
                        excerpt: { type: 'textarea', label: 'Excerpt', placeholder: 'Brief summary of the post' },
                        image: { type: 'text', label: 'Image URL', placeholder: '/images/example.jpg' },
                        category: { type: 'text', label: 'Category', placeholder: 'e.g. Events, Tips' },
                        date: { type: 'text', label: 'Date', placeholder: 'e.g. October 15, 2023' }
                    }}
                    renderItem={(post: any, index: number) => (
                        <JournalPostCard key={post.id || index} post={post} />
                    )}
                    emptyState={
                        <p className="py-20 text-center font-serif text-3xl text-[var(--theme-muted)]">No stories yet.</p>
                    }
                />
            </section>
        </div>
    )
}

function JournalPostCard({ post }: { post: any }) {
    return (
        <article className="grid items-center gap-8 border-t border-[var(--theme-dark)]/10 py-12 md:grid-cols-12 md:gap-12">
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--theme-surface)] md:col-span-7">
                <Image src={post.image || "/images/journal-hero.png"} alt="" fill className="object-cover" />
            </div>
            <div className="md:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">
                    {post.category} · {post.date}
                </p>
                <h2 className="mt-3 font-serif text-4xl font-medium leading-none">{post.title}</h2>
                <p className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]">{post.excerpt}</p>
                <Link href="/plan" className="mt-6 inline-block text-[11px] uppercase tracking-[0.2em] underline">
                    Plan a look like this
                </Link>
            </div>
        </article>
    )
}
