/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.zuplo.com",
      },
      {
        protocol: "https",
        hostname: "img.shields.io",
        pathname: "/github/stars/**",
      },
    ],
  },
};

module.exports = nextConfig;
