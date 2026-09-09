import { redirect } from "next/navigation";

type BookPageProps = { searchParams: Promise<{ service?: string | string[]; category?: string | string[] }> };

// The old multi-step /book wizard is gone. Old links (bookmarked, shared, or
// indexed) still work: they land here and get sent straight into the Book Now
// modal on the homepage, with service/category context preserved.
export default async function BookPage({ searchParams }: BookPageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams({ book: "1" });
  const service = typeof sp.service === "string" ? sp.service : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  if (service) params.set("service", service);
  else if (category) params.set("category", category);
  redirect(`/?${params.toString()}`);
}
