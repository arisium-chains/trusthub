/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      // Turbopack is enabled in dev via `--turbo`. Keep config minimal.
    },
  },
};

export default nextConfig;
