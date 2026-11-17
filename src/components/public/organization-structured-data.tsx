import { company } from "@/content/company";
import { brandMark } from "@/content/brand";
import { serviceAreas } from "@/content/site";
import { siteUrl as baseUrl } from "@/content/site-url";

export function OrganizationStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": new URL("/#organization", baseUrl).toString(),
    name: company.name,
    description: company.description,
    slogan: company.tagline,
    areaServed: serviceAreas.flatMap((area) => area.counties.map((county) => ({
      "@type": "AdministrativeArea",
      name: county,
      containedInPlace: { "@type": "State", name: area.state },
    }))),
    url: new URL("/", baseUrl).toString(),
    logo: new URL(brandMark.colored.src, baseUrl).toString(),
    ...(company.contact.phoneHref ? { telephone: company.contact.phoneHref.replace(/^tel:/, "") } : {}),
    ...(company.contact.email ? { email: company.contact.email } : {}),
    ...(company.socialLinks.length ? { sameAs: company.socialLinks } : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
