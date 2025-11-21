
"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TextEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    multiline?: boolean
}

export function TextEditor({ value, onChange, label, multiline = false }: TextEditorProps) {
    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            {multiline || value.length > 60 ? (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[100px] font-sans"
                    placeholder="Enter text..."
                />
            ) : (
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-sans"
                    placeholder="Enter text..."
                />
            )}
        </div>
    )
}
