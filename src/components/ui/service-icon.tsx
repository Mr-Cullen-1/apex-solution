import type { SVGProps } from "react";

export function ServiceIcon({ service, ...props }: SVGProps<SVGSVGElement> & { service: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {service === "appliance-repair" ? <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M5 9h14M8 6h1M8 12h1" /><circle cx="12" cy="15" r="3" /></>
        : service === "cooling" ? <><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M17 19l-1-4 4-1M4 14l4 1-1 4M17 5l-1 4 4 1" /></>
        : service === "heating" ? <><path d="M13 3c1 5-5 5-3 10 2-1 3-3 3-3 4 3 5 5 4 8-1 2-3 3-5 3-4 0-7-3-7-7 0-5 6-7 8-11Z" /></>
        : <><path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" /><path d="M9 15a3 3 0 0 0 3 3" /></>}
    </svg>
  );
}