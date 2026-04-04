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
        hostname: "postimg.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myschool.ng",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
