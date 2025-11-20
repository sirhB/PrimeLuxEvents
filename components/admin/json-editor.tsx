"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface JsonEditorProps {
    value: string
    onChange: (value: string) => void
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
    const [parsedValue, setParsedValue] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            const parsed = JSON.parse(value)
            setParsedValue(parsed)
            setError(null)
        } catch (e) {
            // Only set error if value is not empty (initial state)
            if (value) setError("Invalid JSON")
        }
    }, [value])

    const handleUpdate = (newValue: any) => {
        setParsedValue(newValue)
        onChange(JSON.stringify(newValue, null, 2))
    }

    const addItem = () => {
        if (Array.isArray(parsedValue)) {
            const newItem = typeof parsedValue[0] === 'object'
                ? Object.keys(parsedValue[0]).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
                : ""
            handleUpdate([...parsedValue, newItem])
        }
    }

    const removeItem = (index: number) => {
        if (Array.isArray(parsedValue)) {
            const newArray = [...parsedValue]
            newArray.splice(index, 1)
            handleUpdate(newArray)
        }
    }

    const updateItem = (index: number, key: string | null, val: string) => {
        if (Array.isArray(parsedValue)) {
            const newArray = [...parsedValue]
            if (typeof newArray[index] === 'object') {
                newArray[index] = { ...newArray[index], [key!]: val }
            } else {
                newArray[index] = val
            }
            handleUpdate(newArray)
        }
    }

    if (error) {
        return (
            <div className="space-y-2">
                <div className="text-red-500 text-sm">{error}</div>
                <Textarea
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                    className="font-mono text-sm min-h-[200px]"
                />
            </div>
        )
    }

    if (!parsedValue) return null

    if (Array.isArray(parsedValue)) {
        return (
            <div className="space-y-4">
                {parsedValue.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 border rounded-md bg-card">
                        <div className="mt-2 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-4">
                            {typeof item === 'object' ? (
                                Object.entries(item).map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <Label className="text-xs uppercase text-muted-foreground">{key}</Label>
                                        {key === 'description' || key === 'quote' || key.length > 50 ? (
                                            <Textarea
                                                value={val as string}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem(index, key, e.target.value)}
                                                className="min-h-[60px]"
                                            />
                                        ) : (
                                            <Input
                                                value={val as string}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <Input
                                    value={item as string}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, null, e.target.value)}
                                />
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive/90"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>
        )
    }

    // Fallback for non-array JSON (just textarea for now)
    return (
        <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
        />
    )
}
