import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
})

/**
 * Report-Only CSP — observes violations without blocking.
 * Allows Stripe, Supabase, Google Maps, Puter, Vercel Analytics, and Next.js defaults.
 */
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  // Next.js needs unsafe-inline/eval without nonces; Stripe/Maps/Puter/Vercel scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://maps.gstatic.com https://js.puter.com https://va.vercel-scripts.com https://*.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com https://*.stripe.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://nominatim.openstreetmap.org https://api.puter.com https://js.puter.com https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep builds green while typing debt is paid down; CI still runs tsc separately.
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicyReportOnly,
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "recharts",
      "date-fns",
      "@stripe/stripe-js",
      "@stripe/react-stripe-js",
    ],
  },
}

export default withSerwist(nextConfig)
