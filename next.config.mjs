/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
  // 允许手机通过局域网访问 dev，避免 404（需带端口）
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '*.local',
    '*.local:3000',
    '192.168.1.21',
    '192.168.1.21:3000',
    '192.168.1.227',
    '192.168.1.227:3000',
    '192.168.0.1',
    '192.168.31.1',
  ],
}

export default nextConfig
