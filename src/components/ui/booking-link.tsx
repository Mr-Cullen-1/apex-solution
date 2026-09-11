"use client";

import type { ComponentPropsWithoutRef } from "react";
import { bookingEntry } from "@/content/cta";
import { useBookNow } from "@/features/booking/book-now-context";
import { ArrowRightIcon } from "./icons";
import { buttonStyles } from "./button-link";

type BookingLinkProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  categoryId?: string;
  serviceId?: string;
  /** Marks this CTA as coming from the First-Time Customer Offer, so the modal
   * shows "Regarding: First-Time Customer Offer — 10%" without the offer terms
   * themselves changing. */
  offer?: boolean;
  variant?: "primary" | "secondary" | "call" | "invert" | "outline-invert" | "footer-outline" | "header-compact" | "text";
  showArrow?: boolean;
};

/** The site-wide "Book Now" trigger. Renders a real <button> (opening a
 * dialog is a button's job, not a link's) that opens the shared Book Now
 * modal, preselecting service/category/offer context when provided. */
export function BookingLink({ children = bookingEntry.label, categoryId, serviceId, offer, variant = "primary", showArrow = true, className = "", onClick, ...props }: BookingLinkProps) {
  const { open } = useBookNow();
  return (
    <button
      type="button"
      className={`${buttonStyles[variant]} ${className}`}
      onClick={(event) => {
        onClick?.(event);
        open({ categoryId, serviceId, offer });
      }}
      {...props}
    >
      {children}
      {showArrow && <ArrowRightIcon className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
    </button>
  );
}
