import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public files are otherwise served with max-age=0, so a returning visitor
  // re-checks every showcase video. A day's cache (then a background
  // re-check) keeps repeat visits free while still picking up a replaced
  // file within a day.
  async headers() {
    return [
      {
        source: "/showcase/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
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
