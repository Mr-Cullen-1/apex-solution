import { serviceCoverageDescription } from "@/content/site";
import { siteUrl as baseUrl } from "@/content/site-url";

export function ServiceStructuredData({ name, description, path }: { name: string; description: string; path: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    // About describes Apex as coordinating independent service providers.
    // Do not identify Apex as the technician performing the work.
    broker: { "@id": new URL("/#organization", baseUrl).toString() },
    // Individual service-by-county availability is not yet established.
    areaServed: serviceCoverageDescription,
    url: new URL(path, baseUrl).toString(),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
