/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.zuplo.com",
      },
    ],
  },
};

module.exports = nextConfig;
