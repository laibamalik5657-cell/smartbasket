import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // bcrypt is a native module; nodemailer does dynamic requires — keep both
  // external so Next doesn't try to bundle them.
  serverExternalPackages: ["bcrypt", "nodemailer"],
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
