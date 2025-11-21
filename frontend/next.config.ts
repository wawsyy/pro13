import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only use ESLint config in frontend directory
    ignoreDuringBuilds: false,
    dirs: ['.'],
  },
  typescript: {
    // Type checking is handled by ESLint
    ignoreBuildErrors: false,
  },
  headers() {
    // FHEVM requires both COOP and COEP for SharedArrayBuffer support
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  }
};

export default nextConfig;

