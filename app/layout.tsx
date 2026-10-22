import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google"
import { SUITE_STORAGE_KEY } from "@/lib/suite"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PwaProvider } from "@/components/providers/pwa-provider"
import { NotificationsProvider } from "@/components/providers/notifications-provider"
import { CartProvider } from "@/components/providers/cart-provider"
import { SiteLayout } from "@/components/site-layout"
import { SiteHeaderWrapper } from "@/components/site-header-wrapper"
import { SiteFooter } from "@/components/site-footer"
import { BRAND_THEME_IDS, DEFAULT_THEME_ID, THEME_STORAGE_KEY } from "@/lib/brand-themes"

const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var allowed=${JSON.stringify(BRAND_THEME_IDS)};var q=new URLSearchParams(location.search).get('theme');var t=(q&&allowed.indexOf(q)>=0)?q:localStorage.getItem(k);if(!t||allowed.indexOf(t)<0)t=${JSON.stringify(DEFAULT_THEME_ID)};if(q&&allowed.indexOf(q)>=0)localStorage.setItem(k,t);document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
const suiteBootScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(SUITE_STORAGE_KEY)});if(s!=='venue'&&s!=='rentals')s='rentals';if(!/^\\/(admin|preview)/.test(location.pathname))s='rentals';document.documentElement.setAttribute('data-suite',s);}catch(e){}})();`

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://primeluxevents.com'),
  title: {
    default: 'PrimeLux Events | Event Rentals in Connecticut',
    template: '%s | PrimeLux Events',
  },
  description: 'Venues, rentals, and the rest of the celebration — serving Connecticut, Rhode Island, and Massachusetts.',
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
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport = {
  themeColor: "#f4f7f5",
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
    <html lang="en" data-theme="midnight-gold" data-suite="rentals" suppressHydrationWarning style={{ colorScheme: 'light' }}>
      <body className={`font-sans antialiased bg-background text-foreground ${cormorant.variable} ${ibmPlexSans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript + suiteBootScript }} />
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
