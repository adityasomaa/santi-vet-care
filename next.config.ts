import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel Image Optimization quota is exhausted on this account. With the
  // optimizer on, every <Image> request returns 402 and production renders blank.
  // Keep this true.
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/art/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
