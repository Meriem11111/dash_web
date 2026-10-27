import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingIncludes: { "/*": ["./data/study-records/**/*.json"] },
};

export default nextConfig;
