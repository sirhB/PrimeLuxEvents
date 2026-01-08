import QRCode from 'qrcode'

/**
 * Generates a QR code as a data URL
 * @param text The text or URL to encode in the QR code
 * @returns A promise that resolves to the data URL string
 */
export async function generateQRCode(text: string): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(text, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        })
        return dataUrl
    } catch (err) {
        console.error('Error generating QR code:', err)
        throw err
    }
}
