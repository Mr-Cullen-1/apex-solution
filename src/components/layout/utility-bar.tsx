import Link from "next/link";
import { Container } from "@/components/ui/container";
import { utilityNavigation } from "@/content/navigation";

export function UtilityBar() {
  return (
    <div className="hidden border-b border-white/15 bg-navy text-white lg:block">
      <Container className="flex min-h-9 items-center justify-between gap-8 text-xs">
        <p className="font-medium tracking-wide">Initial service area · Phoenix Valley</p>
        <nav aria-label="Utility navigation">
          <ul className="flex items-center gap-6">
            {utilityNavigation.map((item) => (
              <li key={item.href}>
                <Link className="text-white/75 transition-colors hover:text-white" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
