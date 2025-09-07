/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  images: {
    domains: process.env.ALLOWED_IMAGE_DOMAINS?.split(',') || [
      'lh3.googleusercontent.com',
    ],
  },
  output: 'standalone',
};

module.exports = nextConfig;
