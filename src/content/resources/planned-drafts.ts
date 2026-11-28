import "server-only";
import { siteUrl } from "@/content/site-url";
import { furnaceArticleDraft } from "./furnace-not-heating";
import { resourceAuthor } from "./author";
import type { Resource } from "@/types/resource";

type DraftBrief = Pick<Resource, "id" | "title" | "slug" | "category" | "categoryLabel" | "primaryKeyword" | "secondaryKeywords" | "excerpt" | "seoTitle" | "metaDescription" | "relatedServices" | "relatedArticles">;

function draft(brief: DraftBrief): Resource {
  return {
    ...brief,
    status: "draft",
    tags: [brief.primaryKeyword, ...brief.secondaryKeywords],
    canonicalUrl: new URL(`/blog/${brief.slug}`, siteUrl).toString(),
    featuredImage: null,
    featuredImageAlt: "",
    author: resourceAuthor,
    publishedAt: null,
    updatedAt: null,
    readingTime: null,
    editorialNote: "Editorial draft only. Write and review the article, verify sources and service claims, assign an approved author and image, and complete the publication checklist before publishing.",
    content: [],
    faqs: [],
  };
}

export const plannedDrafts: readonly Resource[] = [
  { ...draft({
    id: "furnace-not-heating", slug: "furnace-not-heating-common-problems",
    title: "Why Is My Furnace Not Heating? 7 Common Problems and When to Call a Professional",
    category: "hvac-heating", categoryLabel: "Heating / HVAC",
    primaryKeyword: "furnace not heating",
    secondaryKeywords: ["furnace troubleshooting", "furnace repair near me", "furnace not working", "heating system problems", "furnace blowing cold air"],
    excerpt: "Understand seven possible causes of a furnace not heating, the checks homeowners can safely make, and the warning signs that need professional or emergency help.",
    seoTitle: "Furnace Not Heating? 7 Problems & Safe Next Steps",
    metaDescription: "Furnace not heating? Explore seven common causes, safe homeowner checks, urgent warning signs, and when to contact a local professional for furnace repair.",
    relatedServices: ["/services/heating/furnace-repair", "/services/heating/heating-maintenance"],
    relatedArticles: ["why-are-heating-bills-so-high"],
  }), ...furnaceArticleDraft },
  draft({
    id: "frozen-pipes", slug: "how-to-prevent-frozen-pipes-in-winter",
    title: "How to Prevent Frozen Pipes in Winter: 10 Essential Tips for Homeowners",
    category: "home-maintenance", categoryLabel: "Winter Home Maintenance",
    primaryKeyword: "how to prevent frozen pipes",
    secondaryKeywords: ["frozen pipes", "burst pipe repair", "winter pipe protection"],
    excerpt: "A planned educational guide to winter pipe protection and recognizing when a homeowner needs a qualified plumbing professional.",
    seoTitle: "How to Prevent Frozen Pipes in Winter: 10 Tips",
    metaDescription: "Learn about winter pipe protection, preventing frozen pipes, and when to contact a qualified plumbing professional for help.",
    // The existing catalog does not establish a plumbing service. No plumbing CTA/link.
    relatedServices: [], relatedArticles: ["why-are-heating-bills-so-high"],
  }),
  draft({
    id: "water-heater-warning-signs", slug: "water-heater-warning-signs",
    title: "5 Warning Signs Your Water Heater Is About to Fail",
    category: "water-heaters", categoryLabel: "Water Heater",
    primaryKeyword: "water heater problems",
    secondaryKeywords: ["water heater repair", "water heater replacement", "signs of water heater failure"],
    excerpt: "A planned guide to observable water heater problems and preparing for a professional assessment of repair or replacement options.",
    seoTitle: "Water Heater Problems: 5 Warning Signs",
    metaDescription: "Recognize warning signs of water heater problems and learn when to request a professional assessment of your hot-water system.",
    relatedServices: ["/services/water-heater-repair"], relatedArticles: [],
  }),
  draft({
    id: "heating-bills", slug: "why-are-heating-bills-so-high",
    title: "Why Are Your Heating Bills So High? 8 Ways to Reduce Energy Costs This Winter",
    category: "energy-efficiency", categoryLabel: "HVAC / Energy Efficiency",
    primaryKeyword: "high heating bill",
    secondaryKeywords: ["reduce heating costs", "energy efficient heating", "winter heating expenses"],
    excerpt: "A planned guide to understanding a high heating bill and evaluating practical ways to manage winter energy use.",
    seoTitle: "High Heating Bill? 8 Ways to Manage Winter Costs",
    metaDescription: "Explore possible reasons for a high heating bill, practical ways to manage winter energy use, and when heating-system maintenance may help.",
    relatedServices: ["/services/heating/heating-maintenance", "/services/heating/heat-pumps"],
    relatedArticles: ["furnace-not-heating-common-problems", "how-to-prevent-frozen-pipes-in-winter"],
  }),
  draft({
    id: "repair-or-replace", slug: "repair-or-replace-home-appliances",
    title: "Repair or Replace? How to Decide When a Home Appliance Stops Working",
    category: "appliance-repair", categoryLabel: "Appliance Repair",
    primaryKeyword: "repair or replace appliances",
    secondaryKeywords: ["appliance repair cost", "appliance replacement", "washing machine repair", "refrigerator repair"],
    excerpt: "A planned decision guide to repair or replace appliances, including the questions to ask before committing to either option.",
    seoTitle: "Repair or Replace Appliances? A Homeowner Guide",
    metaDescription: "Consider appliance condition, repair options, and replacement needs. Prepare useful questions for a professional appliance assessment.",
    relatedServices: ["/services/appliance-repair"], relatedArticles: [],
  }),
];
