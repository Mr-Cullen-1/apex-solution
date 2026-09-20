import { primaryServices } from "@/content/services";

/** Flattened {value,label} options for the Requests "Service" filter,
 * derived from the live services catalog — never a hand-maintained list
 * that could drift from src/content/services.ts. */
export function getServiceFilterOptions(): { value: string; label: string }[] {
  return primaryServices.flatMap((category) => category.children.map((service) => ({ value: service.id, label: `${category.name} — ${service.name}` })));
}

export type AdminCreateRequestServiceOption = { value: string; label: string; categoryId: string; serviceId: string };

/** Every selectable service *or* category from the same canonical catalog
 * (`primaryServices`), for the Admin Create Request form — mirrors the same
 * category -> service relationship Book Now uses
 * (`resolveServiceRequestContext`, src/features/booking/model.ts): a
 * category with sub-services yields one option per service (categoryId +
 * serviceId both set), while a category with none (e.g. Appliance Repair,
 * Water Heater Repair) yields one category-level option (serviceId empty).
 * `getServiceFilterOptions` above only ever flattens `category.children`,
 * so those two childless categories are entirely absent from it — this is
 * a separate function (not a change to that one, which also backs the
 * Requests page's filter and must keep behaving exactly as it does today)
 * rather than a second, independent, partial service list. */
export function getAdminCreateRequestServiceOptions(): AdminCreateRequestServiceOption[] {
  return primaryServices.flatMap((category) => {
    if (category.children.length === 0) {
      return [{ value: `category:${category.id}`, label: category.name, categoryId: category.id, serviceId: "" }];
    }
    return category.children.map((service) => ({
      value: `service:${service.id}`,
      label: `${category.name} — ${service.name}`,
      categoryId: category.id,
      serviceId: service.id,
    }));
  });
}

/** A plain {categoryId, serviceId} pair, as held by both Admin Create
 * Request's draft state and Campaign Links' form state — never a dedicated
 * "any"/sentinel value: both empty already means "no preselection" all the
 * way down to book_now_create_request's own nullif(...) handling, so no new
 * fake catalog id is ever introduced for that case. */
export type ServiceSelection = { categoryId: string; serviceId: string };

/** Encodes a {categoryId, serviceId} pair into the same `service:<id>` /
 * `category:<id>` value scheme getAdminCreateRequestServiceOptions()'s own
 * options use, so a controlled <select> bound to that pair (Admin Create
 * Request, Campaign Links) can stay in sync without a separate, third piece
 * of state that could drift from the pair actually being submitted.
 * serviceId wins when both are set, matching resolveServiceRequestContext's
 * own precedence (src/features/booking/model.ts). Returns "" for "no
 * selection" -- matched by both forms' own leading "Any service" /
 * "Not specified" option, which is given value="". */
export function encodeServiceSelection({ categoryId, serviceId }: ServiceSelection): string {
  if (serviceId) return `service:${serviceId}`;
  if (categoryId) return `category:${categoryId}`;
  return "";
}

/** The inverse of encodeServiceSelection -- looks the chosen <select> value
 * back up in the same options list to recover its {categoryId, serviceId}
 * pair. An unrecognized value (including "") resolves to
 * {categoryId: "", serviceId: ""} -- "no selection" -- rather than throwing,
 * since a stale option list (e.g. mid-navigation) must never crash the
 * form. */
export function resolveServiceSelection(options: AdminCreateRequestServiceOption[], value: string): ServiceSelection {
  const option = options.find((candidate) => candidate.value === value);
  return { categoryId: option?.categoryId ?? "", serviceId: option?.serviceId ?? "" };
}
