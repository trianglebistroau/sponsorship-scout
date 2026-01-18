/** @type {import('next').NextConfig} */

// Use BACKEND_URL_DEV for local dev, BACKEND_URL_PROD for production
const backendUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL_PROD
    : process.env.BACKEND_URL_DEV || 'http://localhost:8000'

const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH, // Sets the base path for the application.,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${backendUrl}/ws/:path*`,
      },
    ]
  },
}

export default nextConfig
