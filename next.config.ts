import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ffmpeg-installer/ffmpeg picks its platform binary via a runtime
  // require() built from a variable path — Turbopack can't statically
  // resolve that and fails the build. Keep it external so it's just
  // require()'d by Node at runtime instead of bundled.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],
};

export default nextConfig;
