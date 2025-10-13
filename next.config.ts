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
      // Thêm hostname mới cho ảnh sản phẩm
      { // highlight-start
        protocol: 'https',
        hostname: 'supersports.com.vn', 
        port: '',
        pathname: '/**',
      } // highlight-end
    ],
  },
};

export default nextConfig;