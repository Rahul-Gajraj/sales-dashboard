import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable PWA features
  reactStrictMode: true, // Enable React strict mode for improved error handling
  swcMinify: true, // Enable SWC minification for improved performance
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
  },
  experimental: {
    webVitalsAttribution: ["CLS", "LCP"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/icon-:size*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Performance optimizations
  swcMinify: true,

  // Bundle analyzer (uncomment for debugging)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },

  // Environment variables that are safe to expose to client
  env: {
    NEXT_PUBLIC_APP_NAME: "Squad Games",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },

  // Redirect root API calls to GAS when needed
  async rewrites() {
    return [
      // Uncomment when ready to use real GAS endpoints
      // {
      //   source: '/api/gas/:path*',
      //   destination: process.env.NEXT_PUBLIC_GAS_URL + '/:path*'
      // }
    ];
  },
};

export default withPWA({
  dest: "public", // destination directory for the PWA files
  disable: process.env.NODE_ENV === "development", // disable PWA in the development environment
  register: true, // register the PWA service worker
  clientsClaim: true, // makes the new SW take control of open tabs
  skipWaiting: true, // skip waiting for service worker activation
})(nextConfig);
