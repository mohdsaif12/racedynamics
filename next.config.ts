import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Bike and owner photos live in Supabase Storage, e.g.
        // https://xxxxx.supabase.co/storage/v1/object/public/bikes/....
        // The project subdomain isn't known until the client's project
        // exists (see docs/admin-setup.md), so this is a wildcard.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
