"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Package, ShoppingBag, Plus, Minus, CheckCircle2, Loader2, QrCode } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { updateProductStock } from "@/app/admin/scan/actions"
import { toast } from "sonner"
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning"
import { useCapacitor } from "@/components/providers/capacitor-provider"

interface ScanModalProps {
    isOpen: boolean
    onClose: () => void
}

type ScanMode = "navigation" | "inventory" | "picking"

export function ScanModal({ isOpen, onClose }: ScanModalProps) {
    const [mode, setMode] = useState<ScanMode>("navigation")
    const [scanResult, setScanResult] = useState<string | null>(null)
    const [scannedProduct, setScannedProduct] = useState<any>(null)
    const [activeOrders, setActiveOrders] = useState<any[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [isScanning, setIsScanning] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const supabase = createClient()
    const { isNative } = useCapacitor()

    useEffect(() => {
        if (!isOpen) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => {
                    console.error("Failed to clear scanner", error)
                })
                scannerRef.current = null
            }
            return
        }

        if (isNative) {
            // For native, we don't use html5-qrcode-scanner
            return
        }

        const scanner = new Html5QrcodeScanner(
            "modal-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            /* verbose= */ false
        )

        scanner.render(onScanSuccess, onScanFailure)
        scannerRef.current = scanner

        async function onScanSuccess(decodedText: string) {
            setScanResult(decodedText)

            if (mode === "navigation") {
                setIsScanning(false)
                scanner.clear()
                onClose()
                if (decodedText.includes("/admin/")) {
                    const targetPath = decodedText.split("/admin/")[1]
                    router.push(`/admin/${targetPath}`)
                } else if (decodedText.startsWith("/")) {
                    router.push(decodedText)
                }
            } else if (mode === "inventory") {
                setIsScanning(false)
                scanner.clear()
                await handleInventoryScan(decodedText)
            } else if (mode === "picking") {
                if (!selectedOrder) {
                    toast.error("Please select an order first")
                    return
                }
                setIsScanning(false)
                scanner.clear()
                await handlePickingScan(decodedText)
            }
        }

        function onScanFailure(error: any) {
            // ignore
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => {
                    console.error("Failed to clear scanner", error)
                })
                scannerRef.current = null
            }
        }
    }, [isOpen, mode, selectedOrder, onClose, router, isNative])

    useEffect(() => {
        if (isOpen && mode === "picking") {
            fetchActiveOrders()
        }
    }, [isOpen, mode])

    async function fetchActiveOrders() {
        const { data, error } = await supabase
            .from("orders")
            .select("id, customer_name, total_amount, created_at")
            .in("status", ["confirmed", "processing", "out_for_delivery"])
            .order("created_at", { ascending: false })

        if (data) setActiveOrders(data)
    }

    async function handleOrderSelect(orderId: string) {
        setIsLoading(true)
        const order = activeOrders.find((o) => o.id === orderId)
        setSelectedOrder(order)

        const { data, error } = await supabase
            .from("order_items")
            .select("*, products(name)")
            .eq("order_id", orderId)

        if (data) {
            setOrderItems(data.map((item) => ({ ...item, picked: false })))
        }
        setIsLoading(false)
    }

    async function handleInventoryScan(text: string) {
        setIsLoading(true)
        let productId = text
        if (text.includes("/admin/products/")) {
            productId = text.split("/admin/products/")[1].split("?")[0]
        }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single()

        if (data) {
            setScannedProduct(data)
        } else {
            toast.error("Product not found")
            setIsScanning(true)
            // Re-render scanner logic
            restartScanner()
        }
        setIsLoading(false)
    }

    async function handlePickingScan(text: string) {
        setIsLoading(true)
        let productId = text
        if (text.includes("/admin/products/")) {
            productId = text.split("/admin/products/")[1].split("?")[0]
        }

        const itemIndex = orderItems.findIndex((item) => item.product_id === productId && !item.picked)

        if (itemIndex > -1) {
            const newItems = [...orderItems]
            newItems[itemIndex].picked = true
            setOrderItems(newItems)
            toast.success(`Picked: ${newItems[itemIndex].products.name}`)
        } else {
            const alreadyPicked = orderItems.find((item) => item.product_id === productId && item.picked)
            if (alreadyPicked) {
                toast.warning("Item already picked")
            } else {
                toast.error("Item not in this order")
            }
        }
        setIsLoading(false)
    }

    async function adjustStock(amount: number) {
        if (!scannedProduct) return
        setIsLoading(true)
        try {
            const result = await updateProductStock(scannedProduct.id, amount)
            setScannedProduct({ ...scannedProduct, stock: result.newStock })
            toast.success(`Stock updated to ${result.newStock}`)
        } catch (err) {
            toast.error("Failed to update stock")
        }
        setIsLoading(false)
    }

    async function handleNativeScan() {
        try {
            const { camera } = await BarcodeScanner.requestPermissions()
            if (camera !== "granted") {
                toast.error("Camera permission is required")
                return
            }

            const { barcodes } = await BarcodeScanner.scan({
                formats: [BarcodeFormat.QrCode],
            })

            if (barcodes.length > 0) {
                const decodedText = barcodes[0].displayValue
                setScanResult(decodedText)

                if (mode === "navigation") {
                    onClose()
                    if (decodedText.includes("/admin/")) {
                        const targetPath = decodedText.split("/admin/")[1]
                        router.push(`/admin/${targetPath}`)
                    } else if (decodedText.startsWith("/")) {
                        router.push(decodedText)
                    }
                } else if (mode === "inventory") {
                    await handleInventoryScan(decodedText)
                } else if (mode === "picking") {
                    if (!selectedOrder) {
                        toast.error("Please select an order first")
                        return
                    }
                    await handlePickingScan(decodedText)
                }
            }
        } catch (error) {
            console.error("Native scan error:", error)
            toast.error("Failed to scan code")
        }
    }

    function restartScanner() {
        if (isNative) {
            handleNativeScan()
            return
        }
        if (scannerRef.current) {
            scannerRef.current.clear().then(() => {
                const scanner = new Html5QrcodeScanner(
                    "modal-reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    /* verbose= */ false
                )
                scanner.render(async (decodedText: string) => {
                    setScanResult(decodedText)
                    if (mode === "navigation") {
                        setIsScanning(false)
                        scanner.clear()
                        onClose()
                        if (decodedText.includes("/admin/")) {
                            const targetPath = decodedText.split("/admin/")[1]
                            router.push(`/admin/${targetPath}`)
                        } else if (decodedText.startsWith("/")) {
                            router.push(decodedText)
                        }
                    } else if (mode === "inventory") {
                        setIsScanning(false)
                        scanner.clear()
                        await handleInventoryScan(decodedText)
                    } else if (mode === "picking") {
                        if (!selectedOrder) {
                            toast.error("Please select an order first")
                            return
                        }
                        setIsScanning(false)
                        scanner.clear()
                        await handlePickingScan(decodedText)
                    }
                }, (error: any) => { })
                scannerRef.current = scanner
                setIsScanning(true)
            })
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-serif">QR Scanner</h2>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-6">
                                    <Tabs
                                        value={mode}
                                        onValueChange={(v) => {
                                            setMode(v as ScanMode)
                                            setScanResult(null)
                                            setScannedProduct(null)
                                            setIsScanning(true)
                                            // Trigger re-render of scanner via effect or specialized function
                                        }}
                                        className="w-full mb-6"
                                    >
                                        <TabsList className="grid w-full grid-cols-3 bg-black/5 p-1 rounded-2xl h-12">
                                            <TabsTrigger
                                                value="navigation"
                                                className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white"
                                            >
                                                Navigation
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="inventory"
                                                className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white"
                                            >
                                                Inventory
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="picking"
                                                className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white"
                                            >
                                                Picking
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="relative bg-black rounded-3xl overflow-hidden min-h-[300px] flex items-center justify-center">
                                        {!isNative && <div id="modal-reader" className="w-full"></div>}

                                        {isNative && isScanning && !scannedProduct && (!selectedOrder || mode !== "picking") && (
                                            <div className="flex flex-col items-center gap-6 p-12 text-center">
                                                <div className="h-20 w-20 rounded-full bg-gold/20 flex items-center justify-center animate-pulse">
                                                    <Camera className="h-10 w-10 text-gold" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white text-lg font-serif mb-2">Native Scanner Ready</h3>
                                                    <p className="text-gray-400 text-sm">Tap the button below to start scanning</p>
                                                </div>
                                                <Button
                                                    className="bg-gold text-black hover:bg-white transition-colors h-14 px-8 rounded-2xl font-bold uppercase tracking-widest"
                                                    onClick={handleNativeScan}
                                                >
                                                    Start Scanning
                                                </Button>
                                            </div>
                                        )}

                                        {(!isScanning || scannedProduct || (mode === "picking" && selectedOrder)) && (
                                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                                {mode === "inventory" && scannedProduct ? (
                                                    <div className="w-full flex flex-col items-center">
                                                        <div className="h-16 w-16 rounded-3xl bg-gold/10 text-gold flex items-center justify-center mb-6 border border-gold/20">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                        <h3 className="text-2xl font-serif mb-1">{scannedProduct.name}</h3>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                                                            Current Stock: {scannedProduct.stock}
                                                        </p>

                                                        <div className="flex items-center gap-6 mb-12">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-14 w-14 rounded-2xl border-2"
                                                                onClick={() => adjustStock(-1)}
                                                                disabled={isLoading}
                                                            >
                                                                <Minus className="h-6 w-6" />
                                                            </Button>
                                                            <span className="text-4xl font-serif min-w-[60px]">
                                                                {scannedProduct.stock}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-14 w-14 rounded-2xl border-2 bg-black text-white hover:bg-gold hover:text-black border-none"
                                                                onClick={() => adjustStock(1)}
                                                                disabled={isLoading}
                                                            >
                                                                <Plus className="h-6 w-6" />
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            className="w-full bg-black text-white h-14 rounded-2xl font-bold uppercase tracking-widest"
                                                            onClick={restartScanner}
                                                        >
                                                            Done & Scan Next
                                                        </Button>
                                                    </div>
                                                ) : mode === "picking" ? (
                                                    selectedOrder ? (
                                                        <div className="w-full flex flex-col items-center">
                                                            <div className="flex flex-col items-center mb-6">
                                                                <h3 className="text-xl font-serif">
                                                                    {selectedOrder.customer_name}
                                                                </h3>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    Order ID: {selectedOrder.id.slice(0, 8)}
                                                                </p>
                                                            </div>

                                                            <div className="w-full max-h-[200px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                                                                {orderItems.map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`flex items-center justify-between p-3 rounded-xl mb-2 border transition-all ${item.picked
                                                                            ? "bg-green-500/10 border-green-500/20"
                                                                            : "bg-gray-100 border-transparent"
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className={`p-2 rounded-lg ${item.picked
                                                                                    ? "bg-green-500 text-white"
                                                                                    : "bg-gray-200 text-gray-400"
                                                                                    }`}
                                                                            >
                                                                                {item.picked ? (
                                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                                ) : (
                                                                                    <Package className="h-4 w-4" />
                                                                                )}
                                                                            </div>
                                                                            <div className="text-left">
                                                                                <p
                                                                                    className={`text-sm font-bold ${item.picked
                                                                                        ? "text-green-700"
                                                                                        : "text-gray-900"
                                                                                        }`}
                                                                                >
                                                                                    {item.products?.name}
                                                                                </p>
                                                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                                                                                    Qty: {item.quantity}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="flex flex-col gap-3 w-full">
                                                                <Button
                                                                    className="w-full bg-black text-white h-12 rounded-xl font-bold uppercase tracking-widest"
                                                                    onClick={restartScanner}
                                                                >
                                                                    Scan Next Item
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-12 rounded-xl text-gray-400"
                                                                    onClick={() => {
                                                                        setSelectedOrder(null)
                                                                        setOrderItems([])
                                                                        setIsScanning(true)
                                                                        restartScanner()
                                                                    }}
                                                                >
                                                                    Change Order
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full max-w-sm flex flex-col items-center px-4">
                                                            <ShoppingBag className="h-12 w-12 text-gray-200 mb-4" />
                                                            <h3 className="text-lg font-serif mb-6">Select Order to Pick</h3>
                                                            <div className="w-full flex flex-col gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {activeOrders.map((order) => (
                                                                    <Button
                                                                        key={order.id}
                                                                        variant="outline"
                                                                        className="h-auto py-4 rounded-2xl flex flex-col items-start gap-1 border-gray-100 hover:bg-gold hover:text-black hover:border-gold"
                                                                        onClick={() => handleOrderSelect(order.id)}
                                                                    >
                                                                        <span className="font-bold">
                                                                            {order.customer_name}
                                                                        </span>
                                                                        <span className="text-[10px] uppercase tracking-widest opacity-50">
                                                                            #{order.id.slice(0, 8)} • Confirmed
                                                                        </span>
                                                                    </Button>
                                                                ))}
                                                                {activeOrders.length === 0 && (
                                                                    <p className="text-xs text-gray-400 italic">
                                                                        No active orders found
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <>
                                                        <div className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                                                            <QrCode className="h-8 w-8" />
                                                        </div>
                                                        <h3 className="text-xl font-bold mb-2">Code Detected!</h3>
                                                        <p className="text-gray-500 mb-8 break-all font-mono text-xs bg-gray-100 p-3 rounded-lg">
                                                            {scanResult}
                                                        </p>
                                                        <Button
                                                            className="w-full bg-black text-white hover:bg-gold hover:text-black h-12 rounded-xl font-bold"
                                                            onClick={restartScanner}
                                                        >
                                                            Scan Another
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {isLoading && (
                                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
                                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
