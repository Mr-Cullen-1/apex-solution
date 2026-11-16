# Apex design baseline

Captured before implementation, 16 November 2026. Existing SEO audit files are retained as historical evidence. This is an evolution of the existing Next.js site, not a brand replacement.

## Source baseline

| Element | Existing implementation |
| --- | --- |
| Brand | Official Apex logo assets, unchanged; `src/content/brand.ts` |
| Colors | Ink #01213a; dark blue #003973; primary #005098; accent #0376e7 |
| Surfaces | White #ffffff; blue-tinted page/soft surfaces; muted #c9d2dc |
| Text | Ink and slate #4b5768; Geist Sans, self-hosted through the existing font integration |
| Footer | #062b4e to #031c34; cyan #38bdf8; text #d2e2f0 and #a8c2d8 |
| Spacing | Page gutter clamp(1.25rem,4vw,4rem); sections clamp(2rem,4vw,4rem) |
| Shape | Pill controls; 20px cards; 28px panels; 32px heroes |
| Depth | Three shadows, culminating in 0 40px 90px -30px; many nested cards |
| Buttons | Usually 48px; compact header 36px; some modal controls 28–36px |
| Motion | CSS floats, pulses, fades and carousel autoplay; no animation dependency |
| Layout | App Router; reusable service templates; mobile sticky call/booking actions |

All palette values originate in `src/app/globals.css`. Legacy copper aliases already resolve to blue. Preserve them for compatibility; do not reintroduce copper branding. Business data remains in `src/content`.

## Assessment

The site already has a coherent identity and useful real photography. Dense nested panels, large repeated shadows and auto-moving service discovery weaken its hierarchy. The hero's floating availability badges suggest real-time status without a live availability source. The most valuable enhancement is clearer service discovery plus a restrained, service-related dimensional illustration, while retaining authentic photos in the service grid.

## References and access limits

- [Dribbble 3D website gallery](https://dribbble.com/tags/3d-website): accessible gallery content; useful for object-led compositions and clear negative space. Gallery text was inspected, not live animations.
- [Webflow 3D gallery](https://webflow.com/made-in-webflow/3ddesign): accessible examples of interactive scenes, scroll animation and 3D object presentation. Adapt the principle of user-controlled depth, not individual designs.
- [Behance search](https://www.behance.net/search/projects/3d%20web%20design): returned 403; visual study incomplete.
- [Vertex Studio](https://vertexstudio.uz): requested URL repeatedly inaccessible. No claims are made about inspecting its live camera or scroll behavior. Do not substitute an unrelated Vertex domain. Reference review remains open.

Browser host access failed and native access could not verify the current URL. No viewport screenshots or live interaction passes were obtained. Source findings below are distinct from visual validation.

## Architecture constraints

Next 16.3.4 / React 19.2.8 / Tailwind 4 / strict TypeScript. Installed Next metadata, image and server/client documentation reviewed. Existing backend adapters, admin authorization, review moderation, campaign attribution and request persistence must remain intact. No WebGL or animation package is necessary for a small CSS perspective scene.
