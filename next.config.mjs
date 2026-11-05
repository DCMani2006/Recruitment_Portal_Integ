// Proxies /api/* to the real backend, same idea as the Vite proxy in the backend team's demo frontend.
// Set BACKEND_URL (no trailing slash, no /api) in .env.local and in Vercel project settings,
// e.g. BACKEND_URL=https://recruitment-test-backend.onrender.com
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "https://recruitment-test-backend-production.up.railway.app";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};
export default nextConfig;
