import { ResourceListing } from "@/components/resources/resource-listing";
import { getPublishedResources } from "@/content/resources/index";
import { resourceListingMetadata } from "@/lib/resource-seo";

export function generateMetadata() {
  return resourceListingMetadata("Blog & Resources", "Practical appliance, heating and commercial equipment guides from Apex Home Services. Explore troubleshooting checks, maintenance advice and professional service options.", "/blog", getPublishedResources().length > 0);
}
export default function BlogPage() { return <ResourceListing articles={getPublishedResources()} />; }
