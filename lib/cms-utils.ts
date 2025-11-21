
export interface ContentItem {
    id: number
    key: string
    value: string
    type: 'text' | 'json' | 'image'
}

export interface GroupedContent {
    section: string
    items: ContentItem[]
}

/**
 * Parses a content key into a human-readable label.
 * Example: 'home.hero.title' -> 'Hero Title'
 * Example: 'about.story.p1' -> 'Story P1'
 */
export function getLabelFromKey(key: string): string {
    const parts = key.split('.')
    // Remove the first part (page name) if it exists and there are more than 2 parts
    // e.g. home.hero.title -> hero.title
    // but home.title -> home.title (or maybe just Title?)

    // Let's try to be smart:
    // If 3+ parts: remove first, join rest
    // If 2 parts: join all

    const relevantParts = parts.length > 2 ? parts.slice(1) : parts

    return relevantParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
        .replace(/_/g, ' ')
}

/**
 * Groups content items by their second key segment (the "section").
 * Example: 'home.hero.title' -> Section: 'Hero'
 */
export function groupContentBySection(content: ContentItem[]): GroupedContent[] {
    const groups: Record<string, ContentItem[]> = {}

    content.forEach(item => {
        const parts = item.key.split('.')
        // If key is 'home.hero.title', section is 'hero'
        // If key is 'home.title', section is 'general' (or just use 'home'?)

        let section = 'General'
        if (parts.length >= 2) {
            // Use the second part as section, unless it's the last part
            // e.g. home.hero.title -> hero
            // e.g. home.title -> General (or maybe 'Home'?)

            // Actually, for 'home.hero.title', parts[1] is 'hero'.
            // For 'home.title', parts[1] is 'title'. We probably don't want 'Title' as a section.

            if (parts.length > 2) {
                section = parts[1]
            } else {
                // For 'page.key', put in 'General' or maybe the page name itself?
                // Let's stick to 'General' for now to group loose items.
                section = 'General'
            }
        }

        // Capitalize section
        section = section.charAt(0).toUpperCase() + section.slice(1)

        if (!groups[section]) {
            groups[section] = []
        }
        groups[section].push(item)
    })

    // Convert to array and sort by section name (General first if possible, or just alpha)
    return Object.entries(groups).map(([section, items]) => ({
        section,
        items: items.sort((a, b) => a.key.localeCompare(b.key))
    })).sort((a, b) => {
        if (a.section === 'General') return -1
        if (b.section === 'General') return 1
        return a.section.localeCompare(b.section)
    })
}
