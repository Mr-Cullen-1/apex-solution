import type { ComponentPropsWithoutRef } from "react";
import { bookingEntry } from "@/content/cta";
import { ButtonLink } from "./button-link";

type BookingLinkProps = Omit<ComponentPropsWithoutRef<typeof ButtonLink>, "href">;

export function BookingLink({ children = bookingEntry.label, ...props }: BookingLinkProps) {
  return <ButtonLink href={bookingEntry.href} {...props}>{children}</ButtonLink>;
}
