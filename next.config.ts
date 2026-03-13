import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  assetPrefix: './',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
