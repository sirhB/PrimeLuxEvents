import { createClient } from '@/lib/supabase/server'

export type ContentMap = Record<string, any>

export async function getSiteContent() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.from('content').select('*')

        // plux may not have a content table yet — fall back silently
        if (error || !data) return {}

        const contentMap: ContentMap = {}
        data.forEach((item) => {
            if (item.type === 'json') {
                try {
                    contentMap[item.key] = JSON.parse(item.value)
                } catch {
                    contentMap[item.key] = item.value
                }
            } else {
                contentMap[item.key] = item.value
            }
        })

        return contentMap
    } catch {
        return {}
    }
}

export async function getGlobalSettings() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.from('settings').select('key, value')

        // plux may not have a settings table yet — fall back silently
        if (error || !data) return {}

        const settingsMap: Record<string, string> = {}
        data.forEach((item) => {
            settingsMap[item.key] = item.value
        })

        return settingsMap
    } catch {
        return {}
    }
}
