<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Apex Solution project rules

## Product scope

- Build a premium, multi-page US home-services website; never reduce it to a one-page landing page or generic HVAC template.
- Preserve technical precision, trustworthy local service, editorial polish, and clear conversion paths.
- Treat all business details as unverified until supplied. Keep phone, email, address, hours, reviews, statistics, offers, licenses, and guarantees centralized and visibly marked when unknown.
- Phase work deliberately. Do not build future pages or integrations before their roadmap phase unless a task explicitly expands scope.

## Design system

- Use tokens in `src/app/globals.css`; do not scatter raw brand colors across components.
- Keep copper as a small accent. Default to warm white, soft white, navy, slate, steel, and generous whitespace.
- Prefer typography, borders, spacing, and editorial composition over gradients, glass effects, heavy shadows, excessive cards, or decorative motion.
- Motion must be restrained, respect `prefers-reduced-motion`, and never block interaction.
- Mobile is conversion-first. Preserve sticky mobile actions without inventing contact data.

## Architecture

- Use the Next.js App Router, TypeScript strict mode, Tailwind CSS, `next/image`, and `next/font`.
- Keep business content in `src/content`, domain types in `src/types`, reusable UI in `src/components/ui`, and site-wide shell components in `src/components/layout`.
- Use server components by default. Add `"use client"` only at the narrowest interactive boundary.
- Do not add a dependency when a small accessible platform or React solution is sufficient.
- Keep metadata route-specific and use centralized company configuration for site data.
- Keep future booking presentation independent from its CRM or scheduling adapter.

## Quality bar

- Provide semantic landmarks, keyboard access, visible focus states, meaningful labels, and sufficient contrast.
- Do not claim browser, visual, integration, or release validation unless it was performed.
- Before handoff, run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Update relevant docs when architectural, design-system, route, or dependency decisions change.
