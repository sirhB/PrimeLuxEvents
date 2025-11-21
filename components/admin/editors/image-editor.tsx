
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, ExternalLink } from "lucide-react"

interface ImageEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
}

export function ImageEditor({ value, onChange, label }: ImageEditorProps) {
    const [previewError, setPreviewError] = useState(false)

    useEffect(() => {
        setPreviewError(false)
    }, [value])

    return (
        <div className="space-y-4">
            {label && <Label>{label}</Label>}

            <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                    <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="pl-9 font-mono text-sm"
                            placeholder="/path/to/image.jpg or https://..."
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter a local path (starting with /) or a full URL.
                    </p>
                </div>

                {value && !previewError && (
                    <div className="w-32 h-32 shrink-0 border rounded-md overflow-hidden bg-muted relative group">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setPreviewError(true)}
                        />
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ExternalLink className="h-6 w-6 text-white" />
                        </a>
                    </div>
                )}

                {value && previewError && (
                    <div className="w-32 h-32 shrink-0 border rounded-md flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
                        Preview unavailable
                    </div>
                )}
            </div>
        </div>
    )
}
