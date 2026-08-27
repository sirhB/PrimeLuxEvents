import { EditorContentProvider } from '@/components/admin/visual-editor/editor-content-context'

export default function VisualEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EditorContentProvider>{children}</EditorContentProvider>
}
