/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
}

module.exports = nextConfig
