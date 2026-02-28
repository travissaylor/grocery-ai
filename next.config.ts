import type { NextConfig } from "next";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required. Please set it in your .env file."
  );
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
