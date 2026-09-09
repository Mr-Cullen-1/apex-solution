import { company } from "@/content/company";
import { serviceAreas } from "@/content/site";
import { siteUrl as baseUrl } from "@/content/site-url";

export function OrganizationStructuredData({ path }: { path: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    slogan: company.tagline,
    areaServed: serviceAreas.map((area) => ({ "@type": "AdministrativeArea", name: area.state })),
    url: new URL(path, baseUrl).toString(),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
