import { createClient } from '@/lib/supabase/client'
import { unstable_cache } from 'next/cache'

export type ContentMap = Record<string, any>

export async function getSiteContent() {
    const supabase = createClient()

    // We use a client-side supabase instance but fetch in a server component context
    // ideally we should use the server client here if we were passing cookies,
    // but for public content, the anon key is fine.
    // However, to use next/cache properly, we wrap the fetch.

    const fetchContent = unstable_cache(
        async () => {
            const { data, error } = await supabase
                .from('content')
                .select('*')

            if (error) {
                console.error('Error fetching content:', error)
                return {}
            }

            const contentMap: ContentMap = {}
            data.forEach((item) => {
                if (item.type === 'json') {
                    try {
                        contentMap[item.key] = JSON.parse(item.value)
                    } catch (e) {
                        console.error(`Error parsing JSON for key ${item.key}:`, e)
                        contentMap[item.key] = item.value
                    }
                } else {
                    contentMap[item.key] = item.value
                }
            })

            return contentMap
        },
        ['site-content'],
        { revalidate: 60 } // Cache for 60 seconds
    )

    return fetchContent()
}
