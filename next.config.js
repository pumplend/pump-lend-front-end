/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/fauct': { page: '/fauct' },
    };
  },
}

module.exports = nextConfig
