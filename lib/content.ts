import { createClient } from '@/lib/supabase/server'

export type ContentMap = Record<string, any>

export async function getSiteContent() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')

        if (error) {
            console.error('Error fetching content:', error)
            return {}
        }

        const contentMap: ContentMap = {}
        data?.forEach((item) => {
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
    } catch (error) {
        console.error('Error in getSiteContent:', error)
        return {}
    }
}

export async function getGlobalSettings() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('settings')
            .select('key, value')

        if (error) {
            console.error('Error fetching settings:', error)
            return {}
        }

        const settingsMap: Record<string, string> = {}
        data?.forEach((item) => {
            settingsMap[item.key] = item.value
        })

        return settingsMap
    } catch (error) {
        console.error('Error in getGlobalSettings:', error)
        return {}
    }
}
