import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";

export default function ResourceNotFound() {
  return <main id="main-content"><Container className="section-y"><p className="eyebrow">Resources</p><h1 className="mt-4 text-4xl font-semibold">Resource not found</h1><p className="mt-5 max-w-xl leading-7 text-slate">This resource is not available. Explore the resource library or browse Apex service information.</p><ButtonLink href="/resources" className="mt-7">Back to resources</ButtonLink></Container></main>;
}
