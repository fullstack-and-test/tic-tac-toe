/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration for deployment as static HTML
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
