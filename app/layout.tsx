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
    default: 'PrimeLux Events | Event Rentals in Connecticut',
    template: '%s | PrimeLux Events',
  },
  description: 'Furniture, lighting, and décor rentals you can browse and book online — serving CT, RI, and MA.',
  keywords: ['event rentals Shelton CT', 'party rentals Connecticut', 'wedding rentals CT', 'furniture rental CT', 'event lighting rental'],
  manifest: '/manifest-store.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://primeluxevents.com',
    siteName: 'PrimeLux Events',
    title: 'PrimeLux Events | Event Rentals in Connecticut',
    description: 'Beautiful event rentals, delivered on time across Connecticut and nearby states.',
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
    title: 'PrimeLux Events | Event Rentals in Connecticut',
    description: 'Beautiful event rentals, delivered on time across Connecticut and nearby states.',
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
  themeColor: "#0d1014",
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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`font-sans antialiased bg-background text-foreground ${instrumentSerif.variable} ${ibmPlexSans.variable}`}>
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
