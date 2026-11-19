"use client";

import { useEffect } from "react";
import { placementForElement, serviceForPath, trackEvent } from "./events";

/** Delegation covers server-rendered links and client navigation without rebinding. */
export function PublicInteractions() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!event.isTrusted || event.defaultPrevented || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const placement = placementForElement(link);
      const context = { placement, initiator: "link" as const };
      const href = link.getAttribute("href") ?? "";
      if (/^tel:/i.test(href)) {
        trackEvent("phone_click", context);
      } else if (/^(mailto|sms):/i.test(href)) {
        trackEvent("contact_click", { ...context, contact_method: /^mailto:/i.test(href) ? "email" : "sms" });
      } else {
        const url = new URL(link.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === "/contact") trackEvent("contact_click", { ...context, contact_method: "contact_page" });
        const service = serviceForPath(url.pathname);
        if (service && url.pathname !== window.location.pathname) trackEvent("service_select", { ...context, ...service });
      }
    }
    // Capture runs before Next Link prevents default for client navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
