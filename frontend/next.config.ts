import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM requires COOP/COEP, but Base Account SDK conflicts with COOP: same-origin
    // We'll set COEP only, which is less restrictive
    return Promise.resolve([
      {
        source: '/',
        headers: [
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

