import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PwaProvider } from "@/components/providers/pwa-provider"
import { NotificationsProvider } from "@/components/providers/notifications-provider"
import { CartProvider } from "@/components/providers/cart-provider"
import { SiteLayout } from "@/components/site-layout"
import { SiteHeaderWrapper } from "@/components/site-header-wrapper"
import { SiteFooter } from "@/components/site-footer"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://primeluxevents.com'),
  title: {
    default: 'PrimeLux Events | Luxury Event Rentals',
    template: '%s | PrimeLux Events',
  },
  description: 'Premium event rentals from Shelton, CT — serving Connecticut, Rhode Island, and Massachusetts. Furniture, decor, lighting, and packages for weddings and celebrations.',
  keywords: ['luxury event rentals', 'party rentals Shelton CT', 'wedding rentals Connecticut', 'event design', 'furniture rental CT'],
  manifest: '/manifest-store.webmanifest',
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
  themeColor: "#121110",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${instrumentSerif.variable} ${ibmPlexSans.variable}`}>
        <PwaProvider>
          <NotificationsProvider>
            <CartProvider>
              <SiteLayout header={<SiteHeaderWrapper />} footer={<SiteFooter />}>
                {children}
              </SiteLayout>
            </CartProvider>
          </NotificationsProvider>
        </PwaProvider>
        <Analytics />
      </body>
    </html>
  )
}
