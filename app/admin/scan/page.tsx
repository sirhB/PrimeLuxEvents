'use client'

import { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ArrowLeft, Loader2, Camera, User, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        function onScanSuccess(decodedText: string) {
            // handle the scanned code as you like, for example:
            setScanResult(decodedText);
            setIsScanning(false);
            scanner.clear();

            // Check if it's a relative URL from our platform
            if (decodedText.includes('/admin/')) {
                const targetPath = decodedText.split('/admin/')[1];
                router.push(`/admin/${targetPath}`);
            } else if (decodedText.startsWith('/')) {
                router.push(decodedText);
            }
        }

        function onScanFailure(error: any) {
            // handle scan failure, usually better to ignore and keep scanning
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        }
    }, [])

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
                    <Link href="/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-serif font-light tracking-tight">QR Scanner</h1>
                    <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Logistics & Inventory Control</p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-gray-200 overflow-hidden shadow-2xl bg-white">
                <CardHeader className="bg-gray-50/50 border-b p-8 text-center">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-black text-white flex items-center justify-center mb-4 shadow-xl">
                        <Camera className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-serif">Align QR Code</CardTitle>
                    <p className="text-sm text-gray-500 mt-2">Point your camera at a product or order tag to instantly access details.</p>
                </CardHeader>
                <CardContent className="p-0 relative bg-black">
                    <div id="reader" className="w-full overflow-hidden min-h-[400px]"></div>

                    {!isScanning && scanResult && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                                <QrCode className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Code Detected!</h3>
                            <p className="text-gray-500 mb-8 break-all font-mono text-xs bg-gray-100 p-3 rounded-lg">{scanResult}</p>
                            <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                <Button className="w-full bg-black text-white hover:bg-gold hover:text-black h-12 rounded-xl font-bold" onClick={() => window.location.reload()}>
                                    Scan Another
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                                    <Link href="/admin">Return to Dashboard</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white flex flex-col items-center gap-2 text-center shadow-sm">
                    <Package className="h-5 w-5 text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Products</span>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white flex flex-col items-center gap-2 text-center shadow-sm">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Orders</span>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white flex flex-col items-center gap-2 text-center shadow-sm">
                    <User className="h-5 w-5 text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Rental Tags</span>
                </div>
            </div>
        </div>
    )
}
