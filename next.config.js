/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Correct patterns for Facebook
      {
        protocol: "https",
        hostname: "scontent.*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "external.*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "lookaside.fbsbx.com",
      },
      // Your other domains, converted to remotePatterns
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.immediate.co.uk",
      },
    ],
  },
};

module.exports = nextConfig;
