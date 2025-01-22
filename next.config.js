/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  exportPathMap: async function () {
    return {
      "/": { page: "/" },
      "/faucet": { page: "/faucet" },
    };
  },
};

module.exports = nextConfig;
