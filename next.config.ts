import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.96.9.168', '10.96.9.135', 'localhost', '127.0.0.1', '192.168.1.39', '0.0.0.0', '172.18.23.135'],
  async rewrites() {
    const backendUrl = 'https://realestatebackend-sn0i.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
