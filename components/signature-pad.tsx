'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eraser, Check } from 'lucide-react'
import { toast } from 'sonner'
import { signOrder } from '@/app/actions/sign-order'

interface SignaturePadProps {
    orderId: string
    onSigned: (url: string) => void
}

export function SignaturePad({ orderId, onSigned }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const [loading, setLoading] = useState(false)

    const clear = () => {
        sigCanvas.current?.clear()
    }

    const save = async () => {
        if (sigCanvas.current?.isEmpty()) {
            toast.error('Please provide a signature first.')
            return
        }

        setLoading(true)
        const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')

        if (signatureDataUrl) {
            const result = await signOrder(orderId, signatureDataUrl)
            if (result.success && result.url) {
                toast.success('Agreement signed successfully!')
                onSigned(result.url)
            } else {
                toast.error(result.error || 'Failed to save signature')
            }
        }
        setLoading(false)
    }

    return (
        <Card className="w-full max-w-lg mx-auto overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg font-serif">Digital Signature</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-white border-b h-64 touch-none">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                            className: 'w-full h-full cursor-crosshair',
                            style: { width: '100%', height: '100%' }
                        }}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/30 py-4">
                <Button variant="outline" size="sm" onClick={clear} disabled={loading} className="gap-2">
                    <Eraser className="h-4 w-4" />
                    Clear
                </Button>
                <Button size="sm" onClick={save} disabled={loading} className="gap-2">
                    {loading ? (
                        'Saving...'
                    ) : (
                        <>
                            <Check className="h-4 w-4" />
                            Sign Agreement
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
