import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use this package as the tracing root so Next.js does not infer the parent
  // directory (with another package-lock.json) as the workspace root.
  outputFileTracingRoot: path.join(__dirname),

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
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
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
