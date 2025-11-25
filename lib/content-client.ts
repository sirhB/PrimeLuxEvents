import { createClient } from '@/lib/supabase/client'

export type ContentMap = Record<string, any>

export async function getSiteContent(): Promise<ContentMap> {
    const supabase = createClient()

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
}
