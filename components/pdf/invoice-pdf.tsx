import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    gold: {
        color: '#D4AF37',
    },
    companyInfo: {
        textAlign: 'right',
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.5,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#999999',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    col: {
        width: '48%',
    },
    label: {
        fontSize: 9,
        color: '#999999',
        marginBottom: 4,
    },
    value: {
        fontSize: 11,
        color: '#333333',
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9F9F9',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    col1: { width: '60%' },
    col2: { width: '10%', textAlign: 'center' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '15%', textAlign: 'right' },
    th: { fontSize: 9, fontWeight: 'bold', color: '#666666' },
    td: { fontSize: 9, color: '#333333' },
    totalSection: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
        alignSelf: 'flex-end',
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#CCCCCC',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        paddingTop: 20,
    },
    signatureContainer: {
        marginTop: 40,
        width: '150px',
    },
    signatureImage: {
        width: 100,
        height: 50,
        objectFit: 'contain',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    signatureLabel: {
        fontSize: 8,
        color: '#999999',
        marginTop: 4,
    }
});

interface InvoiceProps {
    order: any;
    items: any[];
    settings: any;
}

export const InvoicePDF = ({ order, items, settings }: InvoiceProps) => {
    const formatMoney = (cents: number) => {
        return (cents / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: 'usd',
        });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>
                            PrimeLux<Text style={styles.gold}>.</Text>
                        </Text>
                        <Text style={{ fontSize: 8, color: '#999999', marginTop: 5 }}>Luxury Event Rentals</Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <Text>{settings.company_name || 'PrimeLux Events'}</Text>
                        <Text>{settings.warehouse_address || '123 Luxury Lane, NY 10001'}</Text>
                        <Text>{settings.company_phone}</Text>
                        <Text>{settings.company_email}</Text>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.sectionTitle}>Bill To</Text>
                        <Text style={styles.value}>{order.customer_name}</Text>
                        <Text style={styles.value}>{order.customer_email}</Text>
                        <Text style={styles.value}>{order.customer_phone}</Text>
                    </View>
                    <View style={[styles.col, { textAlign: 'right' }]}>
                        <Text style={styles.sectionTitle}>Invoice Info</Text>
                        <Text style={styles.label}>Invoice ID</Text>
                        <Text style={styles.value}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={[styles.label, { marginTop: 8 }]}>Date</Text>
                        <Text style={styles.value}>{new Date(order.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Event Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <View>
                            <Text style={styles.label}>Event Date</Text>
                            <Text style={styles.value}>{order.delivery_date}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Venue Location</Text>
                            <Text style={styles.value}>{order.delivery_address}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.col1]}>Description</Text>
                        <Text style={[styles.th, styles.col2]}>Qty</Text>
                        <Text style={[styles.th, styles.col3]}>Rate</Text>
                        <Text style={[styles.th, styles.col4]}>Total</Text>
                    </View>
                    {items.map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.td, styles.col1]}>{item.package_name || item.products?.name}</Text>
                            <Text style={[styles.td, styles.col2]}>{item.quantity}</Text>
                            <Text style={[styles.td, styles.col3]}>{formatMoney(item.price_at_time)}</Text>
                            <Text style={[styles.td, styles.col4]}>{formatMoney(item.price_at_time * item.quantity)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.td}>Subtotal</Text>
                        <Text style={styles.td}>{formatMoney(order.subtotal)}</Text>
                    </View>
                    {order.setup_fee > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.td}>Setup Fee</Text>
                            <Text style={styles.td}>{formatMoney(order.setup_fee)}</Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.td}>Tax</Text>
                        <Text style={styles.td}>{formatMoney(order.tax_amount)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.td}>Delivery</Text>
                        <Text style={styles.td}>{formatMoney(order.delivery_fee)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={[styles.td, { fontWeight: 'bold' }]}>Total</Text>
                        <Text style={[styles.td, { fontWeight: 'bold' }]}>{formatMoney(order.total_amount)}</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 10 }]}>
                        <Text style={styles.td}>Amount Paid</Text>
                        <Text style={styles.td}>{formatMoney(order.balance_paid || 0)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text>Balance Due</Text>
                        <Text>{formatMoney(order.total_amount - (order.balance_paid || 0))}</Text>
                    </View>
                </View>

                {/* Signature */}
                {order.signature_url && (
                    <View style={styles.signatureContainer}>
                        <Image src={order.signature_url} style={styles.signatureImage} />
                        <Text style={styles.signatureLabel}>Customer Signature</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for choosing PrimeLux Events. This is a computer-generated invoice.
                    Terms & Conditions apply according to the signed rental agreement.
                </Text>
            </Page>
        </Document>
    );
};
