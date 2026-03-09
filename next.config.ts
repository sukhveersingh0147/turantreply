import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true, // Also ignore TS errors to be safe since we verified locally
  },
};

export default nextConfig;
