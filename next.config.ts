import type { NextConfig } from 'next';

// Static export: VPS-RGF serves dist/client as plain files behind Caddy, so
// there is no image optimisation endpoint either.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
