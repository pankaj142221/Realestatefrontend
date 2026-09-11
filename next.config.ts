import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.96.9.168', '10.96.9.135', 'localhost', '127.0.0.1', '192.168.1.39', '0.0.0.0'],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ? process.env.BACKEND_URL.replace(/\/$/, '') : 'http://127.0.0.1:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
