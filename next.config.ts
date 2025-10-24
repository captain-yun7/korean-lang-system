import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: {    
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      'picsum.photos',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
