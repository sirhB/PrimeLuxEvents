import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
})

/**
 * Enforced CSP. Next.js and Stripe still need unsafe-inline/unsafe-eval until
 * a nonce pipeline exists. The allowlist blocks every other origin.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.js.stripe.com https://maps.googleapis.com https://maps.gstatic.com https://js.puter.com https://va.vercel-scripts.com https://*.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com https://*.stripe.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://r.stripe.com https://m.stripe.network https://q.stripe.com https://maps.googleapis.com https://nominatim.openstreetmap.org https://api.puter.com https://js.puter.com https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://*.stripe.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Photos are served from the CDN; never bundle public/ into serverless functions (Hobby 12-function limit). */
  outputFileTracingExcludes: {
    '/*': ['public/**/*'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  /** Retired Preferred Partner portal -> planner membership; old rooms -> single Pavilion. */
  async redirects() {
    return [
      { source: "/partners", destination: "/planners/membership", permanent: true },
      { source: "/account/partner", destination: "/planners/membership", permanent: true },
      { source: "/account/partner/apply", destination: "/planners/membership", permanent: true },
      { source: "/account/partner/rates", destination: "/planners/membership", permanent: true },
      { source: "/account/partner/payments", destination: "/planners/membership#payouts", permanent: true },
      { source: "/account/partner/branding", destination: "/account/planner/invoices", permanent: true },
      { source: "/account/partner/carts", destination: "/account/planner/carts", permanent: true },
      { source: "/account/partner/carts/:id", destination: "/account/planner/carts", permanent: true },
      ...['the-conservatory', 'the-gallery', 'the-garden-court'].map((slug) => ({
        source: `/venues/${slug}`,
        destination: '/venues/prime-lux-pavilion',
        permanent: true,
      })),
    ]
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
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
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
