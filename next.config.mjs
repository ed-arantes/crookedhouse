/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
 output: 'export',
 distDir: process.env.NEXT_DIST_DIR || '.next',
 images: {
  unoptimized: true,
 },
}

export default nextConfig
