import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: true,
  outputFileTracingIncludes: { "/*": ["./data/study-records/**/*.json"] },
};

export default nextConfig;
