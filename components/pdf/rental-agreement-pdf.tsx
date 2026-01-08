import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#D4AF37',
        paddingBottom: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'normal',
        color: '#000000',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#D4AF37',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 5,
    },
    text: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.6,
        marginBottom: 10,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontSize: 8,
        color: '#999999',
        borderTopWidth: 0.5,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
        height: 60,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signatureImage: {
        width: 120,
        height: 50,
        objectFit: 'contain',
    },
    signatureLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000000',
    },
    signatureSubLabel: {
        fontSize: 8,
        color: '#999999',
        marginTop: 2,
    }
});

interface RentalAgreementProps {
    order: any;
    settings: any;
}

export const RentalAgreementPDF = ({ order, settings }: RentalAgreementProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rental Agreement</Text>
                    <Text style={styles.subtitle}>PrimeLux Events • Luxury Rental Provisions</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.text}>
                        This Rental Agreement is entered into on <Text style={styles.bold}>{new Date(order.created_at).toLocaleDateString()}</Text> by and between
                        <Text style={styles.bold}> PrimeLux Events</Text> (the "Company") and <Text style={styles.bold}>{order.customer_name}</Text> (the "Renter").
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. FINANCIAL COMMITMENTS</Text>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>Reservation Deposit:</Text> A non-refundable 50% deposit is required at point of engagement to secure curated items. This ensures inventory exclusivity for your event date.
                    </Text>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>Final Settlement:</Text> Remaining balances are due seven (7) days prior to delivery. Late settlements may trigger automatic cancellation without refund or incur statutory late charges.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. CONDITION & ACCOUNTABILITY</Text>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>Mandatory Damage Waiver:</Text> Covers minor, expected wear. It does not indemnify against structural damage, neglect, theft, or exposure to elements.
                    </Text>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>Renter Liability:</Text> Renters assume total financial responsibility from point of possession transfer until verified retrieval. Replacement costs for lost or destroyed assets are billed at current market value.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. LOGISTICS & DELIVERY</Text>
                    <Text style={styles.text}>
                        White-glove service is our standard. A minimum two-hour window is required for delivery. Curbside delivery is standard; stairs, elevators, or long-haul distances incur additional labor assessments.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. POSSESSION REVERSAL</Text>
                    <Text style={styles.text}>
                        All items must be returned in the condition they were received. China and glassware must be scraped and rinsed. Linens must be dry and returned in provided garment bags. Furniture must be stacked and ready for retrieval.
                    </Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text style={{ fontSize: 12, color: '#D4AF37' }}>PrimeLux Events</Text>
                        </View>
                        <Text style={styles.signatureLabel}>Authorized Representative</Text>
                        <Text style={styles.signatureSubLabel}>PrimeLux Events</Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            {order.signature_url ? (
                                <Image src={order.signature_url} style={styles.signatureImage} />
                            ) : (
                                <Text style={{ fontSize: 8, color: '#CCCCCC' }}>E-Signed Document</Text>
                            )}
                        </View>
                        <Text style={styles.signatureLabel}>Renter Signature</Text>
                        <Text style={styles.signatureSubLabel}>{order.customer_name}</Text>
                        <Text style={styles.signatureSubLabel}>Signed: {order.signed_at ? new Date(order.signed_at).toLocaleString() : 'N/A'}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    PrimeLux Events • Shelton, CT • {settings.company_phone} • {settings.company_email}
                </Text>
            </Page>
        </Document>
    );
};
