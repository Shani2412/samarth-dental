  /** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  async rewrites() {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      { source: '/api/:path*',     destination: `${API}/api/:path*`     },
      { source: '/uploads/:path*', destination: `${API}/uploads/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

module.exports = nextConfig;
