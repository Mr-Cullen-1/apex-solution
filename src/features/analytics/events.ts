import { primaryServices } from "@/content/services";

export const placements = [
  "header", "header_menu", "header_mobile", "footer", "mobile_dock",
  "home_explorer", "home_offer", "home_pricing", "home_coverage", "home_expertise",
  "service_hero", "service_offer", "service_overview", "service_cta", "service_finder", "other_problem",
  "contact_hero", "contact_details", "contact_cta", "about_hero", "about_cta",
  "brands_hero", "brands_cta", "coverage_hero", "coverage_directory", "coverage_cta",
  "chat_quick", "chat_action", "booking_form", "public_content", "query",
] as const;
export type Placement = typeof placements[number];
export type BookingOrigin = { placement: Placement; initiator: "booking_cta" | "chat_action" | "query" };
type ServiceContext = { category_id?: string; service_id?: string };
type LinkContext = { placement: Placement; initiator: "link" };
type Events = {
  booking_click: ServiceContext & BookingOrigin;
  form_start: ServiceContext & BookingOrigin;
  form_submit: ServiceContext & BookingOrigin;
  phone_click: LinkContext;
  contact_click: LinkContext & { contact_method: "contact_page" | "email" | "sms" };
  service_select: ServiceContext & { placement: Placement; initiator: "link" | "picker" };
};
const eventNames: (keyof Events)[] = ["booking_click", "form_start", "form_submit", "phone_click", "contact_click", "service_select"];
const publicPaths = new Set([
  "/", "/about", "/brands", "/contact", "/service-areas", "/services", "/reviews",
  ...primaryServices.flatMap(category => [category.href, ...category.children.map(service => service.href)]),
]);

export function serviceForPath(path: string) {
  for (const category of primaryServices) {
    if (category.href === path) return { category_id: category.id };
    const service = category.children.find(item => item.href === path);
    if (service) return { category_id: category.id, service_id: service.id };
  }
}

export function placementForElement(element: Element): Placement {
  const value = element.closest("[data-analytics-placement]")?.getAttribute("data-analytics-placement");
  return placements.find(item => item === value)
    ?? (element.closest("header") ? "header" : element.closest("footer") ? "footer" : "public_content");
}

/** Only explicit public paths are eligible, including when admin uses a rewritten URL. */
export function isPublicAnalyticsLocation() {
  return typeof window !== "undefined"
    && !window.location.hostname.toLowerCase().startsWith("admin.")
    && publicPaths.has(window.location.pathname);
}

/** Never use document URL/title/referrer: all can contain customer/private data. */
export function analyticsContext(location: Pick<Location, "hostname" | "origin" | "pathname">) {
  if (location.hostname.toLowerCase().startsWith("admin.") || !publicPaths.has(location.pathname)) return null;
  return {
    analytics_allowed: true,
    page_location: location.origin + location.pathname,
    page_referrer: "",
    page_path: location.pathname,
    page_title: "Apex Home Services",
  };
}

/** One dataLayer writer. Never forward an object, URL, DOM text or user input.
 * Null fields clear the previous event's context in GTM's persistent data model.
 * Tracking failure must never alter a booking result or cancel navigation.
 */
export function trackEvent<E extends keyof Events>(event: E, params: Events[E]): void {
  try {
    if (!isPublicAnalyticsLocation() || !eventNames.includes(event) || !placements.includes(params.placement)) return;
    const booking = event === "booking_click" || event === "form_start" || event === "form_submit";
    const initiators = booking ? ["booking_cta", "chat_action", "query"] : event === "service_select" ? ["link", "picker"] : ["link"];
    if (!initiators.includes(params.initiator) || (event === "booking_click" && params.initiator === "query")) return;
    const context = params as ServiceContext;
    const category = (booking || event === "service_select")
      ? primaryServices.find(item => item.id === context.category_id) : undefined;
    const service = category?.children.find(item => item.id === context.service_id);
    const method = "contact_method" in params ? params.contact_method : undefined;
    if (event === "contact_click" && !["contact_page", "email", "sms"].includes(method ?? "")) return;
    if (event === "service_select" && !category) return;
    const payload = {
      ...analyticsContext(window.location),
      event,
      placement: params.placement,
      initiator: params.initiator,
      page_path: window.location.pathname,
      form_id: booking ? "book_now" : null,
      category_id: category?.id ?? null,
      service_id: service?.id ?? null,
      contact_method: event === "phone_click" ? "phone" : event === "contact_click" ? method : null,
    };
    const analyticsWindow = window as Window & { dataLayer?: object[] };
    (analyticsWindow.dataLayer ??= []).push(payload);
  } catch {
    // A third-party listener may throw. Analytics must remain non-blocking.
  }
}
