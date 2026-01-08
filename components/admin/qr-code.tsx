'use client'

import { useState, useEffect } from 'react'
import { generateQRCode } from '@/lib/qr'
import { Button } from '@/components/ui/button'
import { QrCode, Download, Loader2, Maximize2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface AdminQRCodeProps {
    url: string
    label?: string
}

export function AdminQRCode({ url, label }: AdminQRCodeProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadQR() {
            try {
                const dataUrl = await generateQRCode(url)
                setQrDataUrl(dataUrl)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        loadQR()
    }, [url])

    const downloadQR = () => {
        if (!qrDataUrl) return
        const link = document.createElement('a')
        link.href = qrDataUrl
        link.download = `qr-${label || 'code'}.png`
        link.click()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 w-48 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="relative group cursor-pointer aspect-square w-48 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {qrDataUrl && (
                    <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-none p-8">
                            <DialogHeader>
                                <DialogTitle className="text-center font-serif text-2xl mb-4">{label || 'QR Code'}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-6">
                                <div className="p-4 bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[350px]">
                                    <img src={qrDataUrl!} alt="Large QR Code" className="w-full h-auto" />
                                </div>
                                <Button onClick={downloadQR} className="w-full max-w-[350px] bg-black text-white hover:bg-gold hover:text-black rounded-xl h-12">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download High Res PNG
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={downloadQR} size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {label && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">{label}</p>}
        </div>
    )
}
