/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 's3.us-west-2.amazonaws.com', 'prod-files-secure.s3.us-west-2.amazonaws.com'],
  },
}

module.exports = nextConfig
