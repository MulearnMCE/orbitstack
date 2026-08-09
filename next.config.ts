import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma needs to be treated as external in server components
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
