'use client'

import { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ArrowLeft, Loader2, Camera, Package, ShoppingBag, Plus, Minus, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { updateProductStock } from './actions'
import { toast } from 'sonner'

type ScanMode = 'navigation' | 'inventory' | 'picking'

export default function ScanPage() {
    const [mode, setMode] = useState<ScanMode>('navigation')
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

        async function onScanSuccess(decodedText: string) {
            setScanResult(decodedText);

            if (mode === 'navigation') {
                setIsScanning(false);
                scanner.clear();
                if (decodedText.includes('/admin/')) {
                    const targetPath = decodedText.split('/admin/')[1];
                    router.push(`/admin/${targetPath}`);
                } else if (decodedText.startsWith('/')) {
                    router.push(decodedText);
                }
            } else if (mode === 'inventory') {
                setIsScanning(false);
                scanner.clear();
                await handleInventoryScan(decodedText);
            } else if (mode === 'picking') {
                if (!selectedOrder) {
                    toast.error("Please select an order first");
                    return;
                }
                setIsScanning(false);
                scanner.clear();
                await handlePickingScan(decodedText);
            }
        }

        function onScanFailure(error: any) {
            // ignore
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        }
    }, [mode, selectedOrder])

    useEffect(() => {
        if (mode === 'picking') {
            fetchActiveOrders();
        }
    }, [mode])

    async function fetchActiveOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('id, customer_name, total_amount, created_at')
            .in('status', ['confirmed', 'processing', 'out_for_delivery'])
            .order('created_at', { ascending: false });

        if (data) setActiveOrders(data);
    }

    async function handleOrderSelect(orderId: string) {
        setIsLoading(true);
        const order = activeOrders.find(o => o.id === orderId);
        setSelectedOrder(order);

        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(name)')
            .eq('order_id', orderId);

        if (data) {
            setOrderItems(data.map(item => ({ ...item, picked: false })));
        }
        setIsLoading(false);
    }

    async function handleInventoryScan(text: string) {
        setIsLoading(true);
        let productId = text;
        if (text.includes('/admin/products/')) {
            productId = text.split('/admin/products/')[1].split('?')[0];
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (data) {
            setScannedProduct(data);
        } else {
            toast.error("Product not found");
            setIsScanning(true);
            window.location.reload();
        }
        setIsLoading(false);
    }

    async function handlePickingScan(text: string) {
        setIsLoading(true);
        let productId = text;
        if (text.includes('/admin/products/')) {
            productId = text.split('/admin/products/')[1].split('?')[0];
        }

        const itemIndex = orderItems.findIndex(item => item.product_id === productId && !item.picked);

        if (itemIndex > -1) {
            const newItems = [...orderItems];
            newItems[itemIndex].picked = true;
            setOrderItems(newItems);
            toast.success(`Picked: ${newItems[itemIndex].products.name}`);
        } else {
            const alreadyPicked = orderItems.find(item => item.product_id === productId && item.picked);
            if (alreadyPicked) {
                toast.warning("Item already picked");
            } else {
                toast.error("Item not in this order");
            }
        }
        setIsLoading(false);
    }

    async function adjustStock(amount: number) {
        if (!scannedProduct) return;
        setIsLoading(true);
        try {
            const result = await updateProductStock(scannedProduct.id, amount);
            setScannedProduct({ ...scannedProduct, stock: result.newStock });
            toast.success(`Stock updated to ${result.newStock}`);
        } catch (err) {
            toast.error("Failed to update stock");
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-serif font-light tracking-tight">Scanner V2</h1>
                        <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Logistics & Inventory</p>
                    </div>
                </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => {
                setMode(v as ScanMode);
                setScanResult(null);
                setScannedProduct(null);
                setScannedProduct(null);
                setIsScanning(true);
            }} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/5 p-1 rounded-2xl h-12">
                    <TabsTrigger value="navigation" className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white">Navigation</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white">Inventory</TabsTrigger>
                    <TabsTrigger value="picking" className="rounded-xl data-[state=active]:bg-black data-[state=active]:text-white">Picking</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card className="rounded-[2.5rem] border-gray-200 overflow-hidden shadow-2xl bg-white border-none glass-card">
                <CardHeader className="bg-gray-50/50 border-b p-8 text-center border-none">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-black text-white flex items-center justify-center mb-4 shadow-xl">
                        <Camera className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-serif">
                        {mode === 'navigation' ? 'Navigation Mode' : mode === 'inventory' ? 'Stock Adjustment' : 'Order Picking'}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        {mode === 'navigation' ? 'Scan to view details' : mode === 'inventory' ? 'Scan a product to adjust stock' : 'Scan items for an order'}
                    </p>
                </CardHeader>
                <CardContent className="p-0 relative bg-black min-h-[400px] flex items-center justify-center">
                    <div id="reader" className="w-full overflow-hidden min-h-[400px]"></div>

                    {(!isScanning || scannedProduct || (mode === 'picking' && selectedOrder)) && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                            {mode === 'inventory' && scannedProduct ? (
                                <div className="w-full flex flex-col items-center">
                                    <div className="h-16 w-16 rounded-3xl bg-gold/10 text-gold flex items-center justify-center mb-6 border border-gold/20">
                                        <Package className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-serif mb-1">{scannedProduct.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Current Stock: {scannedProduct.stock}</p>

                                    <div className="flex items-center gap-6 mb-12">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-16 w-16 rounded-2xl border-2"
                                            onClick={() => adjustStock(-1)}
                                            disabled={isLoading}
                                        >
                                            <Minus className="h-6 w-6" />
                                        </Button>
                                        <span className="text-4xl font-serif min-w-[60px]">{scannedProduct.stock}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-16 w-16 rounded-2xl border-2 bg-black text-white hover:bg-gold hover:text-black border-none"
                                            onClick={() => adjustStock(1)}
                                            disabled={isLoading}
                                        >
                                            <Plus className="h-6 w-6" />
                                        </Button>
                                    </div>

                                    <Button className="w-full bg-black text-white h-14 rounded-2xl font-bold uppercase tracking-widest" onClick={() => {
                                        setScannedProduct(null);
                                        setIsScanning(true);
                                        // The useEffect will re-run when isScanning changes, but we need to re-render the scanner
                                        // and since html5-qrcode-scanner is a bit finicky, we'll just toggle the mode briefly or find another way
                                        window.location.reload();
                                    }}>
                                        Done & Scan Next
                                    </Button>
                                </div>
                            ) : mode === 'picking' ? (
                                selectedOrder ? (
                                    <div className="w-full flex flex-col items-center">
                                        <div className="flex flex-col items-center mb-6">
                                            <h3 className="text-xl font-serif">{selectedOrder.customer_name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID: {selectedOrder.id.slice(0, 8)}</p>
                                        </div>

                                        <div className="w-full max-h-[250px] overflow-y-auto mb-8 pr-2">
                                            {orderItems.map((item, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl mb-2 border transition-all ${item.picked ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-100 border-transparent'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${item.picked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                            {item.picked ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-sm font-bold ${item.picked ? 'text-green-700' : 'text-gray-900'}`}>{item.products?.name}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col gap-3 w-full">
                                            <Button className="w-full bg-black text-white h-12 rounded-xl font-bold uppercase tracking-widest" onClick={() => {
                                                setIsScanning(true);
                                                // Trigger scanner restart
                                                window.location.reload();
                                            }}>
                                                Scan Next Item
                                            </Button>
                                            <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-400" onClick={() => {
                                                setSelectedOrder(null);
                                                setOrderItems([]);
                                                setIsScanning(true);
                                                window.location.reload();
                                            }}>
                                                Change Order
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-sm flex flex-col items-center px-4">
                                        <ShoppingBag className="h-12 w-12 text-gray-200 mb-4" />
                                        <h3 className="text-lg font-serif mb-6">Select Order to Pick</h3>
                                        <div className="w-full flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                            {activeOrders.map(order => (
                                                <Button
                                                    key={order.id}
                                                    variant="outline"
                                                    className="h-auto py-4 rounded-2xl flex flex-col items-start gap-1 border-gray-100 hover:bg-gold hover:text-black hover:border-gold"
                                                    onClick={() => handleOrderSelect(order.id)}
                                                >
                                                    <span className="font-bold">{order.customer_name}</span>
                                                    <span className="text-[10px] uppercase tracking-widest opacity-50">#{order.id.slice(0, 8)} • Confirmed</span>
                                                </Button>
                                            ))}
                                            {activeOrders.length === 0 && (
                                                <p className="text-xs text-gray-400 italic">No active orders found</p>
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
                                    <p className="text-gray-500 mb-8 break-all font-mono text-xs bg-gray-100 p-3 rounded-lg">{scanResult}</p>
                                    <Button className="w-full bg-black text-white hover:bg-gold hover:text-black h-12 rounded-xl font-bold" onClick={() => window.location.reload()}>
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
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-3xl border flex flex-col items-center gap-2 text-center transition-all ${mode === 'inventory' ? 'bg-gold/10 border-gold shadow-lg' : 'bg-white/50 border-transparent shadow-sm'}`}>
                    <Package className={`h-5 w-5 ${mode === 'inventory' ? 'text-gold' : 'text-gray-300'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Stock Control</span>
                </div>
                <div className={`p-4 rounded-3xl border flex flex-col items-center gap-2 text-center transition-all ${mode === 'picking' ? 'bg-gold/10 border-gold shadow-lg' : 'bg-white/50 border-transparent shadow-sm'}`}>
                    <ShoppingBag className={`h-5 w-5 ${mode === 'picking' ? 'text-gold' : 'text-gray-300'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Order Picking</span>
                </div>
            </div>
        </div>
    )
}
