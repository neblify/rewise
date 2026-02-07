import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  // @ts-expect-error - serverActions is supported in Next.js 16 but types are not updated yet
  serverActions: {
    bodySizeLimit: '5mb',
  },
};

export default nextConfig;
