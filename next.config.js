/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      serverComponentsExternalPackages: ["mongoose"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',  // allow any
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
