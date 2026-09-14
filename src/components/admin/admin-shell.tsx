"use client";

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { company } from "@/content/company";
import { logoutAction } from "@/features/admin/auth/actions";
import { CloseIcon, GridIcon, InboxIcon, LockIcon, LogoutIcon, MenuIcon, ShieldIcon, StarIcon, UsersIcon } from "@/components/ui/icons";
import type { AdminRole } from "@/features/admin/auth/types";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;
type NavLink = { href: string; label: string; icon: NavIcon };
type NavGroup = { heading: string; links: NavLink[] };

const OVERVIEW_GROUP: NavGroup = { heading: "Overview", links: [{ href: "/admin", label: "Dashboard", icon: GridIcon }] };

const OPERATIONS_GROUP: NavGroup = {
  heading: "Operations",
  links: [
    { href: "/admin/requests", label: "Requests", icon: InboxIcon },
    { href: "/admin/customers", label: "Customers", icon: UsersIcon },
    { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
  ],
};

const ADMINISTRATION_GROUP: NavGroup = { heading: "Administration", links: [{ href: "/admin/admins", label: "Admins", icon: ShieldIcon }] };

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Independent admin application shell — never the public SiteHeader/Footer
 * (see src/app/(marketing)/layout.tsx, which is where those live instead).
 * Desktop: fixed left sidebar + sticky top bar (breadcrumb + account) + main
 * workspace. Mobile: compact top bar that opens a slide-in nav drawer, never
 * a forced-desktop layout. Navigation is role-based: only SUPER_ADMIN sees
 * "Admins" — this is a UX nicety only, never the security boundary
 * (requireSuperAdmin() on the route/actions is that). */
export function AdminShell({ children, role, email }: { children: ReactNode; role: AdminRole; email: string }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const groups = role === "SUPER_ADMIN" ? [OVERVIEW_GROUP, OPERATIONS_GROUP, ADMINISTRATION_GROUP] : [OVERVIEW_GROUP, OPERATIONS_GROUP];
  const allLinks = groups.flatMap((group) => group.links);
  const activeLink = [...allLinks].reverse().find((link) => isActive(pathname, link.href));
  const isDetailRoute = activeLink ? pathname !== activeLink.href : false;

  return (
    <div className="min-h-full bg-page-bg">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-steel md:bg-surface">
        <SidebarContent pathname={pathname} groups={groups} email={email} role={role} showIdentity={false} />
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
            <SidebarContent pathname={pathname} groups={groups} email={email} role={role} showIdentity onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="md:pl-64">
        <div className="sticky top-0 z-20 hidden border-b border-steel bg-surface/95 px-6 py-3.5 backdrop-blur-sm md:flex md:items-center md:justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate">Admin</span>
            {activeLink && (
              <>
                <span className="text-steel">/</span>
                <span className="font-semibold text-navy">{activeLink.label}</span>
              </>
            )}
            {isDetailRoute && (
              <>
                <span className="text-steel">/</span>
                <span className="font-semibold text-ink-muted">Detail</span>
              </>
            )}
          </nav>
          <AccountChip email={email} role={role} />
        </div>

        <main>
          <div className="mx-auto max-w-6xl px-page py-8 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AccountChip({ email, role }: { email: string; role: AdminRole }) {
  const initial = email.trim().charAt(0).toUpperCase() || "A";
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-primary">{initial}</span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-navy">{email}</p>
        <p className="text-xs text-slate">{role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  groups,
  email,
  role,
  showIdentity,
  onNavigate,
}: {
  pathname: string;
  groups: NavGroup[];
  email: string;
  role: AdminRole;
  /** The desktop sidebar never shows this — the top bar's AccountChip is
   * the single source of truth for admin identity there. The mobile nav
   * drawer has no separate top bar with an account chip, so it's the one
   * place identity still needs to live for small screens. */
  showIdentity: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center gap-2.5 px-1">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-navy text-xs font-bold text-white">{company.name.charAt(0)}</span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-navy">{company.name}</p>
          <p className="text-xs text-slate">Admin</p>
        </div>
      </div>

      <nav aria-label="Admin" className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.heading} className="flex flex-col gap-1">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-steel">{group.heading}</p>
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-brand-soft text-brand-primary" : "text-slate hover:bg-page-bg hover:text-navy"
                  }`}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-1 border-t border-steel pt-4">
        <p className="px-3 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-steel">Account</p>
        {showIdentity && (
          <div className="mb-1 flex items-center gap-2.5 px-3 py-1.5">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[0.65rem] font-bold text-brand-primary">
              {email.trim().charAt(0).toUpperCase() || "A"}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold text-navy">{email}</p>
              <p className="text-[0.7rem] text-slate">{role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
            </div>
          </div>
        )}
        <Link
          href="/admin/change-password"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-semibold text-slate transition-colors hover:bg-page-bg hover:text-navy"
        >
          <LockIcon className="size-4.5" />
          Change Password
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-sm font-semibold text-slate transition-colors hover:bg-page-bg hover:text-navy"
          >
            <LogoutIcon className="size-4.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
