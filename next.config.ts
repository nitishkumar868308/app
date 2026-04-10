import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "app.yatripay.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "staging-api.yatripay.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.yatripay.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
