import { Container } from "@/components/ui/container";
import { legalDrafts } from "@/content/legal";

export function LegalDraft({ kind }: { kind: keyof typeof legalDrafts }) {
  const draft = legalDrafts[kind];
  return (
    <main id="main-content" className="flex-1 bg-page-bg py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow">Awaiting business-owner approval</p>
          <h1 className="mt-4 text-4xl font-semibold text-navy">{draft.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate">This is a draft page structure, not an approved {draft.title.toLowerCase()}. The business details and legal text are awaiting verification and approval.</p>
          <h2 className="mt-10 text-2xl font-semibold text-navy">Sections awaiting approval</h2>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-slate">
            {draft.sections.map(section => <li key={section}>{section}</li>)}
          </ul>
        </div>
      </Container>
    </main>
  );
}
