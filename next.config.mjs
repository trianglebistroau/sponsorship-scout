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
    const rewrites = [];
    // WebSocket upgrades only — /api/v1/onboarding/* is handled by dedicated
    // route handlers in src/app/api/v1/onboarding/*/route.ts which have
    // a long timeout for Gemini video analysis.
    const wsBase = process.env.BACKEND_URL_PROD || process.env.BACKEND_URL_DEV;
    if (wsBase && wsBase.startsWith('http')) {
      rewrites.push({ source: '/ws/:path*', destination: `${wsBase}/ws/:path*` });
    }
    return rewrites;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shadcnstudio.com',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        { loader: 'raw-loader' },
        { loader: 'glslify-loader' },
      ],
    })
    return config
  },
  turbopack: {}
}

export default nextConfig
