'use client'

import { useRef, useState } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface SignatureCanvasProps {
    onSave: (signatureData: string) => void
    onClear: () => void
}

export function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
    const signatureRef = useRef<SignaturePad>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const handleClear = () => {
        if (signatureRef.current) {
            signatureRef.current.clear()
            setIsEmpty(true)
            onClear()
        }
    }

    const handleEnd = () => {
        if (signatureRef.current) {
            if (!signatureRef.current.isEmpty()) {
                setIsEmpty(false)
                onSave(signatureRef.current.getTrimmedCanvas().toDataURL('image/png'))
            }
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Sign below</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gold h-8 px-2"
                >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Clear
                </Button>
            </div>

            <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden relative touch-none">
                <SignaturePad
                    ref={signatureRef}
                    canvasProps={{
                        className: "w-full h-32 sm:h-40 cursor-crosshair",
                        style: { width: '100%', height: '128px' }
                    }}
                    onEnd={handleEnd}
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 px-4">
                        <p className="text-xs sm:text-sm font-light italic text-center">Sign with your finger or mouse</p>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
                Attached to your rental agreement and stored securely.
            </p>
        </div>
    )
}
