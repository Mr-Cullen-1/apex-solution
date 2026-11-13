"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function FooterVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Keep the review submission flow focused, including invitation links.
  if (pathname === "/review" || pathname.startsWith("/review/")) return null;
  return children;
}
