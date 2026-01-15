import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { CapacitorProvider } from "@/components/providers/capacitor-provider"
import { NotificationsProvider } from "@/components/providers/notifications-provider"
import { CartProvider } from "@/components/providers/cart-provider"
import { SiteLayout } from "@/components/site-layout"

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  metadataBase: new URL('https://primeluxevents.com'),
  title: {
    default: 'PrimeLux Events | Luxury Event Rentals',
    template: '%s | PrimeLux Events',
  },
  description: 'Premium event rentals for weddings, corporate events, and luxury gatherings. Elevate your event with our curated collection of furniture, decor, and lighting.',
  keywords: ['luxury event rentals', 'wedding rentals', 'event design', 'party rentals', 'furniture rental'],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://primeluxevents.com',
    siteName: 'PrimeLux Events',
    title: 'PrimeLux Events | Luxury Event Rentals',
    description: 'Elevate your event with our curated collection of luxury rentals.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PrimeLux Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrimeLux Events | Luxury Event Rentals',
    description: 'Elevate your event with our curated collection of luxury rentals.',
    images: ['/images/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrimeLux Events',
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

import { headers } from "next/headers"

// ... (keep existing code)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const isNative = headersList.get("x-is-native") === "true"

  return (
    <html lang="en">
      <body className={`font-sans antialiased ${playfair.variable} ${_geist.variable} ${_geistMono.variable}`}>
        <CapacitorProvider initialIsNative={isNative}>
          <NotificationsProvider>
            <CartProvider>
              <SiteLayout>{children}</SiteLayout>
            </CartProvider>
          </NotificationsProvider>
        </CapacitorProvider>
        <Analytics />
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
