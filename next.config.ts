import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oolllomwpghuecledaou.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Next.js 15 optimizations
  // Performance optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // SWC minification is enabled by default in Next.js 15
  // Use webpack for warning suppression (Turbopack doesn't support ignoreWarnings)
  webpack: (config, { isServer }) => {
    // Suppress punycode deprecation warning
    config.ignoreWarnings = [
      {
        module: /node_modules\/punycode/,
      },
      {
        message: /The `punycode` module is deprecated/,
      },
      {
        message: /DEP0040/,
      },
    ];
    
    return config;
  },

};

export default nextConfig;
