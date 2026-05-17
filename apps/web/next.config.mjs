/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@arch/core"],
  reactStrictMode: true,
  webpack: (config) => {
    // Our workspace packages use NodeNext-style ".js" imports on .ts files.
    // Tell webpack to try .ts/.tsx when it sees a .js import that doesn't exist.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
