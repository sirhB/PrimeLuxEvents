import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export type ContentMap = Record<string, any>

export async function getSiteContent() {
    const supabase = await createClient()

    // Use server-side supabase client for proper build-time data fetching
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
