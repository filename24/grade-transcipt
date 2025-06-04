import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig
