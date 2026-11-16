# 3D and motion plan

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
