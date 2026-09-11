import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Approved review photos (Phase 3) render from short-lived signed URLs
  // into the private `review-media` Supabase Storage bucket — never a
  // permanent public URL. Scoped to the storage-sign path specifically
  // (not the whole Supabase host) since that's the only kind of remote
  // image this project ever loads.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/sign/**" }],
  },
  // Plumbing and Indoor Air Quality are no longer marketed public services (client
  // request). Redirect old links instead of leaving them as bare 404s. Water Heater
  // Repair is the direct successor to the old Plumbing position; Indoor Air Quality
  // has no successor category, so it sends visitors to the main Services experience.
  async redirects() {
    return [
      { source: "/services/plumbing", destination: "/services/water-heater-repair", permanent: false },
      { source: "/services/plumbing/:service", destination: "/services/water-heater-repair", permanent: false },
      { source: "/services/air-quality", destination: "/services", permanent: false },
    ];
  },
};

export default nextConfig;
