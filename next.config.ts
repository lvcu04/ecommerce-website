import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kiwisizing.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supersports.com.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 👇 Thêm phần này để proxy API sang backend container hoặc domain thực
  async rewrites() {
    return [
      {
        source: "/api/:path*",             // Khi frontend gọi /api/...
        destination: "http://backend-web1:3001/:path*", // chuyển tiếp sang backend container
      },
    ];
  },
};

export default nextConfig;
