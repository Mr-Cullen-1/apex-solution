"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findServiceContext, getCategoryById } from "./model";
import { BookNowModal } from "./book-now-modal";

type OpenOptions = { categoryId?: string; serviceId?: string; offer?: boolean; issue?: string };
type BookNowContextValue = { open: (options?: OpenOptions) => void };

const BookNowContext = createContext<BookNowContextValue | null>(null);

export function useBookNow() {
  const context = useContext(BookNowContext);
  if (!context) throw new Error("useBookNow must be used within BookNowProvider");
  return context;
}

export function BookNowProvider({ children }: { children: React.ReactNode }) {
  // `nonce` is bumped on every open() call and used as the modal's React key,
  // so each open mounts a fresh instance with a clean form — no reset-on-open
  // effect required.
  const [state, setState] = useState<{ isOpen: boolean; nonce: number } & OpenOptions>({ isOpen: false, nonce: 0 });

  const open = useCallback((options: OpenOptions = {}) => setState((current) => ({ isOpen: true, nonce: current.nonce + 1, ...options })), []);
  const close = useCallback(() => setState((current) => ({ ...current, isOpen: false })), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <BookNowContext.Provider value={value}>
      {children}
      <BookNowModal key={state.nonce} isOpen={state.isOpen} categoryId={state.categoryId} serviceId={state.serviceId} offer={state.offer} issue={state.issue} onClose={close} />
      <Suspense fallback={null}>
        <BookNowUrlSync open={open} />
      </Suspense>
    </BookNowContext.Provider>
  );
}

/** Makes old /book?service=... links (and any ?book=1 link) open the modal
 * automatically, then strips the query so back/refresh doesn't reopen it. */
function BookNowUrlSync({ open }: { open: (options?: OpenOptions) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const shouldOpen = searchParams.has("book") || searchParams.has("service") || searchParams.has("category");
    if (!shouldOpen) return;

    const serviceId = searchParams.get("service") ?? "";
    const categoryId = searchParams.get("category") ?? "";
    const offer = searchParams.get("offer") === "1";
    const serviceContext = serviceId ? findServiceContext(serviceId) : undefined;
    const category = !serviceContext && categoryId ? getCategoryById(categoryId) : undefined;

    open({
      serviceId: serviceContext?.service.id,
      categoryId: serviceContext?.category.id ?? category?.id,
      offer,
    });

    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
