'use client'

import { useRef, useState } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, RotateCcw } from 'lucide-react'

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
        <Card className="p-4 border-gold/10 bg-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Digital Signature</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gold"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            </div>

            <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden relative group">
                <SignaturePad
                    ref={signatureRef}
                    canvasProps={{
                        className: "w-full h-40 cursor-crosshair",
                        style: { width: '100%', height: '160px' }
                    }}
                    onEnd={handleEnd}
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                        <p className="text-sm font-light italic">Sign here with your mouse or finger</p>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-gray-400 mt-4 leading-relaxed italic">
                This signature will be appended to your rental agreement and stored securely.
            </p>
        </Card>
    )
}
