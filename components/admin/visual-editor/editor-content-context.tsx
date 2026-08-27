'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type ContentMap = Record<string, unknown>

type EditorContentContextValue = {
  content: ContentMap
  settings: Record<string, string>
  dirtyKeys: Set<string>
  savingKeys: Set<string>
  lastSavedAt: Date | null
  isLoading: boolean
  updateField: (key: string, value: unknown) => void
  saveField: (key: string, value?: unknown) => Promise<boolean>
  saveAll: () => Promise<void>
  setContent: (content: ContentMap) => void
  setSettings: (settings: Record<string, string>) => void
  setIsLoading: (loading: boolean) => void
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

export function EditorContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ContentMap>({})
  const [settings, setSettingsState] = useState<Record<string, string>>({})
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set())
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const setContent = useCallback((next: ContentMap) => {
    setContentState(next)
    setDirtyKeys(new Set())
  }, [])

  const setSettings = useCallback((next: Record<string, string>) => {
    setSettingsState(next)
  }, [])

  const updateField = useCallback((key: string, value: unknown) => {
    setContentState((prev) => ({ ...prev, [key]: value }))
    setDirtyKeys((prev) => new Set(prev).add(key))
  }, [])

  const saveField = useCallback(
    async (key: string, value?: unknown): Promise<boolean> => {
      const resolvedValue = value !== undefined ? value : content[key]
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
    [content, supabase],
  )

  const saveAll = useCallback(async () => {
    const keys = Array.from(dirtyKeys)
    if (keys.length === 0) return

    await Promise.all(keys.map((key) => saveField(key)))
    toast.success('All changes saved')
  }, [dirtyKeys, saveField])

  const value = useMemo(
    () => ({
      content,
      settings,
      dirtyKeys,
      savingKeys,
      lastSavedAt,
      isLoading,
      updateField,
      saveField,
      saveAll,
      setContent,
      setSettings,
      setIsLoading,
    }),
    [
      content,
      settings,
      dirtyKeys,
      savingKeys,
      lastSavedAt,
      isLoading,
      updateField,
      saveField,
      saveAll,
      setContent,
      setSettings,
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
