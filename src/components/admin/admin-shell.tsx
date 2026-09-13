"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { company } from "@/content/company";
import { logoutAction } from "@/features/admin/auth/actions";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import type { AdminRole } from "@/features/admin/auth/types";

const BASE_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reviews", label: "Reviews" },
] as const;

const SUPER_ADMIN_NAV_LINK = { href: "/admin/admins", label: "Admins" } as const;

/** Independent admin application shell — never the public SiteHeader/Footer
 * (see src/app/(marketing)/layout.tsx, which is where those live instead).
 * Desktop: fixed left sidebar + main workspace. Mobile: compact top bar
 * that opens a slide-in nav drawer, never a forced-desktop layout.
 * Navigation is role-based: only SUPER_ADMIN sees "Admins" — this is a UX
 * nicety only, never the security boundary (requireSuperAdmin() on the
 * route/actions is that). */
export function AdminShell({ children, role }: { children: ReactNode; role: AdminRole }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navLinks = role === "SUPER_ADMIN" ? [...BASE_NAV_LINKS, SUPER_ADMIN_NAV_LINK] : BASE_NAV_LINKS;

  return (
    <div className="min-h-full bg-page-bg">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col md:border-r md:border-steel md:bg-surface">
        <SidebarContent pathname={pathname} navLinks={navLinks} />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-steel bg-surface px-4 py-3 md:hidden">
        <span className="text-sm font-bold tracking-tight text-navy">{company.name}</span>
        <button
          type="button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          onClick={() => setMobileNavOpen((open) => !open)}
          className="inline-flex size-9 items-center justify-center rounded-control border border-steel text-navy"
        >
          {mobileNavOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {mobileNavOpen && (
        <div id="admin-mobile-nav" className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-ink/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-hero">
            <SidebarContent pathname={pathname} navLinks={navLinks} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-page py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  navLinks,
  onNavigate,
}: {
  pathname: string;
  navLinks: readonly { href: string; label: string }[];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-5">
      <span className="hidden text-sm font-bold tracking-tight text-navy md:block">{company.name}</span>
      <nav aria-label="Admin" className="mt-2 flex flex-col gap-1 md:mt-8">
        {navLinks.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`rounded-control px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-brand-soft text-brand-primary" : "text-slate hover:bg-page-bg hover:text-navy"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <Link
          href="/admin/change-password"
          onClick={onNavigate}
          className="rounded-control border border-steel px-3 py-2.5 text-sm font-semibold text-slate transition-colors hover:border-navy hover:text-navy"
        >
          Change Password
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-control border border-steel px-3 py-2.5 text-left text-sm font-semibold text-slate transition-colors hover:border-navy hover:text-navy"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
