import { primaryServices } from "@/content/services";

/** Flattened {value,label} options for the Requests "Service" filter,
 * derived from the live services catalog — never a hand-maintained list
 * that could drift from src/content/services.ts. */
export function getServiceFilterOptions(): { value: string; label: string }[] {
  return primaryServices.flatMap((category) => category.children.map((service) => ({ value: service.id, label: `${category.name} — ${service.name}` })));
}
