/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

