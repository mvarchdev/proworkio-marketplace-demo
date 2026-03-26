import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@proworkio/config",
    "@proworkio/lib",
    "@proworkio/openapi",
    "@proworkio/types",
    "@proworkio/ui",
  ],
};

export default nextConfig;
