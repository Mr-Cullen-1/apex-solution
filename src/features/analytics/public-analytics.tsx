"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsContext } from "./events";

type AnalyticsWindow = Window & { dataLayer?: unknown[]; apexAnalyticsPath?: string; apexGtmLoaded?: boolean };

/** Activation requires the reviewed container AND stream settings in the runbook.
 * No third-party bootstrap or noscript pixel is allowed on a private entry URL.
 */
export function PublicAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GTM_ID;
    const measurementId = process.env.NEXT_PUBLIC_GA4_ID;
    if (process.env.NEXT_PUBLIC_ANALYTICS_READY !== "true" || !/^GTM-[A-Z0-9]+$/.test(id ?? "") || !/^G-[A-Z0-9]+$/.test(measurementId ?? "")) return;
    const win = window as AnalyticsWindow;
    const context = analyticsContext(window.location);
    const disableKey = `ga-disable-${measurementId}`;
    Object.assign(win, { [disableKey]: !context });
    win.dataLayer ??= [];
    // gtag's command queue requires Arguments, not a plain array.
    function command(...args: unknown[]) {
      void args;
      // eslint-disable-next-line prefer-rest-params -- Google command queue expects IArguments.
      win.dataLayer!.push(arguments);
    }
    if (!context) {
      win.apexAnalyticsPath = undefined;
      win.dataLayer.push({ analytics_allowed: false, page_location: "", page_referrer: "", page_title: "", page_path: "" });
      return;
    }
    command("set", { ...context, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    if (!win.apexGtmLoaded) {
      win.apexGtmLoaded = true;
      win.dataLayer.push({ ...context, "gtm.start": Date.now(), event: "gtm.js" });
      win.dataLayer.push({ ...context, event: "apex_analytics_init" });
      const script = document.createElement("script");
      script.id = "apex-gtm";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
      document.head.appendChild(script);
    }
    if (win.apexAnalyticsPath !== context.page_location) {
      win.apexAnalyticsPath = context.page_location;
      win.dataLayer.push({ ...context, event: "apex_page_view" });
    }
    return () => { Object.assign(win, { [disableKey]: true }); };
  }, [pathname]);
  return null;
}
