/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 允许手机通过局域网 IP 访问 dev 时的静态资源，避免 404
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.227'],
}

export default nextConfig
