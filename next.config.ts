import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
