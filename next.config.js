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
        protocol: "https",
        hostname: "myschoolgist.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imghippo.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
