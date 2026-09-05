import { company } from "@/content/company";
import { serviceAreas } from "@/content/site";

export function ServiceStructuredData({ name, description, path }: { name: string; description: string; path: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    provider: { "@type": "Organization", name: company.name },
    areaServed: serviceAreas.map((area) => ({ "@type": "AdministrativeArea", name: area.state })),
    url: new URL(path, baseUrl).toString(),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
