import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.96.9.168', 'localhost', '127.0.0.1', '192.168.1.39', '0.0.0.0'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL 
          ? `${process.env.BACKEND_URL}/api/:path*` 
          : 'http://127.0.0.1:5000/api/:path*' // Proxy to Backend
      }
    ]
  }
};

export default nextConfig;
