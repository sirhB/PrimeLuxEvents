/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'recharts',
      'date-fns',
      'lucide-react',
      '@stripe/stripe-js',
      '@stripe/react-stripe-js'
    ],
  },
}

export default nextConfig