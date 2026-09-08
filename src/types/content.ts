export type NavigationItem = {
  label: string;
  href: `/${string}` | "/";
  description?: string;
  children?: NavigationItem[];
};

export type ContactDetails = {
  phone: string | null;
  phoneHref: string | null;
  smsHref: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
};

export type ServiceSeo = {
  title: string;
  description: string;
};

export type ServiceFAQ = {
  question: string;
  answer: string;
};

export type ServiceProblem = {
  id: string;
  label: string;
  description: string;
  href: `/services/${string}` | "/book";
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  href: `/services/${string}`;
  shortDescription: string;
  summary: string;
  description: string;
  signs: readonly string[];
  overview: readonly string[];
  relatedServiceIds: readonly string[];
  problems: readonly ServiceProblem[];
  faqs: readonly ServiceFAQ[];
  brandGroupIds: readonly SupportedBrandGroup["id"][];
  mediaId: string;
  seo: ServiceSeo;
  status: "published" | "placeholder";
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  href: `/services/${string}`;
  shortDescription: string;
  description: string;
  mediaId: string;
  brandGroupIds: readonly SupportedBrandGroup["id"][];
  problems: readonly ServiceProblem[];
  faqs: readonly ServiceFAQ[];
  children: readonly Service[];
  layout: "image-led" | "directory" | "technical";
  seo: ServiceSeo;
  status: "published" | "placeholder";
};

export type ServiceArea = {
  state: string;
  code: "NY" | "NJ" | "CT" | "MA" | "RI";
  slug: string;
  counties: readonly string[];
};

export type SupportedBrandGroup = {
  id: "appliances" | "premium-appliances" | "hvac";
  label: string;
  brands: readonly string[];
};
export type Review = { id: string; quote: string; author: string; location: string | null; rating: number; source: string; verified: boolean; date: string | null };
export type FAQ = { id: string; question: string; answer: string };
export type Project = { id: string; title: string; service: string; location: string | null; summary: string; mediaId: string; status: "concept" | "verified" };
export type ResourceArticle = { slug: string; title: string; excerpt: string; category: string; publishedAt: string | null; status: "planned" | "published"; mediaId: string };

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  focalPoint: string;
  temporary: boolean;
};
