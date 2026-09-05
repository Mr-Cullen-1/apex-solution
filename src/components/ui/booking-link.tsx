import type { ComponentPropsWithoutRef } from "react";
import { bookingEntry } from "@/content/cta";
import { ButtonLink } from "./button-link";

type BookingLinkProps = Omit<ComponentPropsWithoutRef<typeof ButtonLink>, "href"> & {
  categoryId?: string;
  serviceId?: string;
};

export function BookingLink({ children = bookingEntry.label, categoryId, serviceId, ...props }: BookingLinkProps) {
  const query = serviceId ? `?service=${encodeURIComponent(serviceId)}` : categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
  return <ButtonLink href={`${bookingEntry.href}${query}`} {...props}>{children}</ButtonLink>;
}
