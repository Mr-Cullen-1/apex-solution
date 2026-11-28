import { notFound, permanentRedirect } from "next/navigation";
import { getResourceCategory, resourceCategoryPath } from "@/content/resources/categories";
export default async function LegacyCategoryPage({ params }: { params: Promise<{ category: string }> }) {
 const { category } = await params;
 if (category === "hvac-heating") permanentRedirect("/blog/category/heating");
 if (["water-heaters", "appliance-repair", "home-maintenance", "energy-efficiency"].includes(category)) permanentRedirect("/blog");
 const entry = getResourceCategory(category);
 if (!entry) notFound();
 permanentRedirect(resourceCategoryPath(entry.id));
}
