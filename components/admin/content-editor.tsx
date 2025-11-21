
"use client"

import { JsonEditor } from "@/components/admin/json-editor"
import { TextEditor } from "@/components/admin/editors/text-editor"
import { ImageEditor } from "@/components/admin/editors/image-editor"

interface ContentEditorProps {
    type: 'text' | 'json' | 'image'
    value: string
    onChange: (value: string) => void
    label?: string
}

export function ContentEditor({ type, value, onChange, label }: ContentEditorProps) {
    if (type === 'json') {
        return (
            <div className="space-y-2">
                {label && <div className="font-medium text-sm text-muted-foreground mb-2">{label}</div>}
                <JsonEditor value={value} onChange={onChange} />
            </div>
        )
    }

    if (type === 'image') {
        return <ImageEditor value={value} onChange={onChange} label={label} />
    }

    return <TextEditor value={value} onChange={onChange} label={label} multiline={value.length > 50} />
}
