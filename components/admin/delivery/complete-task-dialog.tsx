'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, Camera, Upload } from 'lucide-react'

interface CompleteTaskDialogProps {
    task: { id: string; title: string }
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function CompleteTaskDialog({ task, trigger, onSuccess }: CompleteTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [notes, setNotes] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient()

        try {
            let imageUrl = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${task.id}-${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                // Upload image to 'task-images' bucket
                // Note: Ensure this bucket exists in Supabase storage
                const { error: uploadError } = await supabase.storage
                    .from('task-images')
                    .upload(filePath, imageFile)

                if (uploadError) {
                    // If bucket doesn't exist, we might fail here. 
                    // For now, let's log it and proceed without image or try to create bucket logic elsewhere.
                    // Assuming bucket exists or we handle error gracefully.
                    console.error('Error uploading image:', uploadError)
                    toast.error('Failed to upload image, but completing task anyway.')
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('task-images')
                        .getPublicUrl(filePath)
                    imageUrl = publicUrl
                }
            }

            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 'completed',
                    completion_notes: notes,
                    completion_image_url: imageUrl,
                    completed_at: new Date().toISOString(),
                    // completed_by: user.id // We need auth context for this
                })
                .eq('id', task.id)

            if (error) throw error

            toast.success('Task completed successfully')
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error('Error completing task:', error)
            toast.error('Failed to complete task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                    <DialogDescription>
                        Mark "{task.title}" as complete.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Proof of Delivery (Optional)</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <div className="relative w-full h-48">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-md"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                        <p className="text-white font-medium">Change Photo</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to take a photo or upload</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                capture="environment" // Hints mobile browsers to use camera
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Completion Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any notes about the delivery..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? 'Completing...' : 'Complete Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
