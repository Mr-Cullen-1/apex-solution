import type { Metadata } from "next";
import { AreasJournalAndFinal } from "@/components/home/areas-journal-and-final";
import { ExpertiseAndStandard } from "@/components/home/expertise-and-standard";
import { HeroAndSelector } from "@/components/home/hero-and-selector";
import { StoryAndProblems } from "@/components/home/story-and-problems";
import { WorkCareAndProof } from "@/components/home/work-care-and-proof";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "Premium Home Comfort Services",
  description: company.description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <HeroAndSelector />
      <ExpertiseAndStandard />
      <StoryAndProblems />
      <WorkCareAndProof />
      <AreasJournalAndFinal />
    </main>
  );
}
