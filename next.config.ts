import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // bcrypt is a native module — keep it external so Next doesn't try to bundle it.
  serverExternalPackages: ["bcrypt"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pictures.grocerapps.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qne.com.pk',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
