import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pg, bcryptjs, jsonwebtoken as server-only — don't bundle them for the edge
  serverExternalPackages: ["pg", "bcryptjs", "jsonwebtoken"],

  // Expose public env vars to the client
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Dr. Snehal Korade CaseBook",
    NEXT_PUBLIC_DOCTOR_NAME: process.env.NEXT_PUBLIC_DOCTOR_NAME || "Dr. Snehal Korade",
    NEXT_PUBLIC_INACTIVITY_MINUTES: process.env.SESSION_INACTIVITY_MINUTES || "15",
  },

  // Optimize images from S3/MinIO
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/casebook-files/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
