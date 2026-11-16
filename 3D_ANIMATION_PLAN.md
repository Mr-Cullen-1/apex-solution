# 3D and motion plan

## Implemented refinement — 2026-11-16

The explorer now has distinct appliance/cooling/heating/hot-water icons, selected equipment labels, a dark grid canvas and explicit 2D/3D controls. Phone and compact tablet users open the illustration on demand; task selection and booking stay visible independently. The desktop view remains manual, with reduced-motion and unsupported-3D fallbacks. No package or WebGL renderer was added. See `docs/UX_UI_AUDIT_2026-11-16.md` for the latest verification status; the browser release checks below remain required.

Use a small CSS perspective cutaway home in the homepage hero. The house is decorative; labeled HTML controls select heating, cooling, appliance and water-heater context. An ordinary service link provides the next step. Geometry is an illustration, never a diagnostic representation or a photograph of actual work.

## Interaction and fallback

- Native buttons, selected state via aria-pressed; no drag-only, hover-only or scroll-jacked interaction.
- Manual camera rotation on wider screens; default static view on mobile. Selected service changes explanatory text and highlighted equipment.
- No animation loop, external model download, canvas, WebGL context, physics package or renderer dependency.
- Reduced motion disables camera interpolation; static geometry and all service links remain usable.
- Narrow client boundary only for selection and camera state. Main marketing copy and navigation remain server-rendered.
- Subtle card hover and focus transitions use transform/color; no delayed reveal hiding essential content.

## Performance and verification

Keep scene markup compact and reserve its height to prevent shifts. CSS 3D support failure must leave all semantic service content functional. Validate scene appearance in Safari, Firefox and Chromium, mobile clipping, keyboard order, reduced motion and 200% zoom before release. Browser performance/visual measurements currently unavailable; zero new runtime packages is a design choice, not proof of Core Web Vitals scores.

Deferred: full interactive WebGL environment, scroll-linked camera tours and additional service-specific 3D scenes. Add only after measured evidence shows a benefit and the initial scene passes browser review.
