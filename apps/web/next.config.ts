import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/waiver',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
