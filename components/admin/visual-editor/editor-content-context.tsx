'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getPageKeyPrefix } from '@/lib/admin/visual-editor-config'

type ContentMap = Record<string, unknown>

type EditorContentContextValue = {
  content: ContentMap
  settings: Record<string, string>
  dirtyKeys: Set<string>
  savingKeys: Set<string>
  lastSavedAt: Date | null
  isLoading: boolean
  loadError: string | null
  updateField: (key: string, value: unknown) => void
  saveField: (key: string, value?: unknown) => Promise<boolean>
  saveAll: () => Promise<void>
  loadPage: (pageId: string) => Promise<void>
}

const EditorContentContext = createContext<EditorContentContextValue | null>(null)

function serializeValue(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function inferDbType(key: string, value: unknown): 'text' | 'json' | 'image' {
  if (key.includes('image')) return 'image'
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return 'json'
  return 'text'
}

function parseContentValue(value: unknown) {
  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

export function EditorContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ContentMap>({})
  const [settings, setSettingsState] = useState<Record<string, string>>({})
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set())
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const contentRef = useRef(content)
  contentRef.current = content

  // Stable browser client — create once per provider mount
  const supabase = useMemo(() => createClient(), [])
  const loadGeneration = useRef(0)

  const updateField = useCallback((key: string, value: unknown) => {
    setContentState((prev) => ({ ...prev, [key]: value }))
    setDirtyKeys((prev) => new Set(prev).add(key))
  }, [])

  const saveField = useCallback(
    async (key: string, value?: unknown): Promise<boolean> => {
      const resolvedValue = value !== undefined ? value : contentRef.current[key]
      const serialized = serializeValue(resolvedValue)
      const dbType = inferDbType(key, resolvedValue)

      setSavingKeys((prev) => new Set(prev).add(key))

      try {
        const { data: existing } = await supabase
          .from('content')
          .select('id')
          .eq('key', key)
          .maybeSingle()

        let error: Error | null = null
        if (existing) {
          const { error: updateError } = await supabase
            .from('content')
            .update({ value: serialized, type: dbType })
            .eq('key', key)
          error = updateError
        } else {
          const { error: insertError } = await supabase
            .from('content')
            .insert([{ key, value: serialized, type: dbType }])
          error = insertError
        }

        if (error) throw error

        setContentState((prev) => ({ ...prev, [key]: resolvedValue }))
        setDirtyKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        setLastSavedAt(new Date())
        return true
      } catch (error) {
        console.error('Failed to save field:', key, error)
        toast.error(`Failed to save ${key.split('.').pop() ?? 'field'}`)
        return false
      } finally {
        setSavingKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [supabase],
  )

  const saveAll = useCallback(async () => {
    const keys = Array.from(dirtyKeys)
    if (keys.length === 0) return

    await Promise.all(keys.map((key) => saveField(key)))
    toast.success('All changes saved')
  }, [dirtyKeys, saveField])

  const loadPage = useCallback(
    async (pageId: string) => {
      const generation = ++loadGeneration.current
      setIsLoading(true)
      setLoadError(null)
      setDirtyKeys(new Set())

      const keyPrefix = getPageKeyPrefix(pageId)

      try {
        const [contentRes, settingsRes] = await Promise.all([
          supabase.from('content').select('*').like('key', `${keyPrefix}%`),
          supabase.from('settings').select('key, value'),
        ])

        // Ignore stale responses after a newer load started
        if (generation !== loadGeneration.current) return

        if (contentRes.error) {
          console.error('Error fetching content:', contentRes.error)
          setLoadError(contentRes.error.message)
          setContentState({})
          toast.error('Failed to load content')
        } else {
          const contentMap = (contentRes.data ?? []).reduce(
            (acc: ContentMap, item) => {
              acc[item.key] = parseContentValue(item.value)
              return acc
            },
            {},
          )
          setContentState(contentMap)
          setLoadError(null)
        }

        if (!settingsRes.error && settingsRes.data) {
          const settingsMap: Record<string, string> = {}
          settingsRes.data.forEach((item) => {
            settingsMap[item.key] = item.value
          })
          setSettingsState(settingsMap)
        }
      } catch (error) {
        if (generation !== loadGeneration.current) return
        console.error('Error loading page content:', error)
        setLoadError(error instanceof Error ? error.message : 'Unknown error')
        toast.error('Failed to load content')
      } finally {
        if (generation === loadGeneration.current) {
          setIsLoading(false)
        }
      }
    },
    [supabase],
  )

  const value = useMemo(
    () => ({
      content,
      settings,
      dirtyKeys,
      savingKeys,
      lastSavedAt,
      isLoading,
      loadError,
      updateField,
      saveField,
      saveAll,
      loadPage,
    }),
    [
      content,
      settings,
      dirtyKeys,
      savingKeys,
      lastSavedAt,
      isLoading,
      loadError,
      updateField,
      saveField,
      saveAll,
      loadPage,
    ],
  )

  return (
    <EditorContentContext.Provider value={value}>
      {children}
    </EditorContentContext.Provider>
  )
}

export function useEditorContent() {
  return useContext(EditorContentContext)
}
