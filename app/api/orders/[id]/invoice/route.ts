import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';
import { RentalAgreementPDF } from '@/components/pdf/rental-agreement-pdf';
import React from 'react';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'invoice';
        const supabase = await createClient();

        // Fetch order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch items
        const { data: items } = await supabase
            .from('order_items')
            .select('*, products(*)')
            .eq('order_id', orderId);

        // Fetch settings for company info
        const { data: settingsData } = await supabase.from('settings').select('key, value');
        const settings: Record<string, string> = {};
        settingsData?.forEach((s) => (settings[s.key] = s.value));

        // Create PDF stream
        const pdfElement = type === 'agreement'
            ? React.createElement(RentalAgreementPDF, { order, settings })
            : React.createElement(InvoicePDF, { order, items: items || [], settings });

        const stream = await renderToStream(pdfElement as React.ReactElement<any>);

        // Convert stream to response
        const response = new NextResponse(stream as any);
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set(
            'Content-Disposition',
            `attachment; filename=${type}-${orderId.slice(0, 8)}.pdf`
        );

        return response;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
