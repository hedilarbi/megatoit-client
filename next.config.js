// next.config.js
module.exports = {
  images: {
    domains: [
      "images.immediate.co.uk",
      "firebasestorage.googleapis.com",
      "scontent.ftun16-1.fna.fbcdn.net",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" }, // all facebook CDNs
      { protocol: "https", hostname: "**.fbsbx.com" }, // platform/lookaside
      { protocol: "https", hostname: "lookaside.facebook.com" },
      { protocol: "https", hostname: "graph.facebook.com" }, // if you ever use graph image URLs
    ],
  },
};
