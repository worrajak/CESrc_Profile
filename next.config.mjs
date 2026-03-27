/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone' is used for Docker only
  // Vercel uses default output for optimal caching & dynamic rendering
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' } : {}),
};

export default nextConfig;
