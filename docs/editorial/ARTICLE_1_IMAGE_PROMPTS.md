# Article 1: original AI image provenance and exact prompts

Generated 26 November 2026 using the built-in `image_gen` tool, opaque backgrounds, one independently generated image per subject. These are AI-generated illustrations with a photographic style, not documentary photographs of Apex work. No stock images, fake placeholder files, logos, labels or credential claims were used.

All selected original PNGs are 1672 × 941. Copies are preserved under `public/resources/furnace-not-heating-common-problems/`. The existing installed Sharp pipeline converted them to 1600 × 900 WebP at quality 84, effort 6, with a negligible center crop to exact 16:9; no stretching or semantic editing. No new package or image service was installed. The article uses the WebPs through the existing `ResourceImage` / `next/image` pipeline.

| Subject | Original PNG | Integrated WebP |
| --- | --- | --- |
| Hero | `residential-gas-furnace-hero-original.png` | `residential-gas-furnace-hero.webp` |
| Filters | `dirty-and-clean-furnace-air-filters-original.png` | `dirty-and-clean-furnace-air-filters.webp` |
| Winter vent | `snow-blocked-furnace-intake-vent-original.png` | `snow-blocked-furnace-intake-vent.webp` |
| Inspection | `professional-furnace-inspection-original.png` | `professional-furnace-inspection.webp` |

The exact delivered-file dimensions, byte sizes and SHA-256 hashes are in `output/article-1/image-manifest.json`. The inspection subject was generated a second time with a tighter frontal composition to avoid questionable peripheral piping details. Only the selected final version is integrated and copied into the project's public directory; generated source files remain in the tool's original output directory.

## Featured furnace — exact prompt

```text
Use case: photorealistic-natural. Generate one original landscape 16:9 editorial photograph for an American home-services article about a furnace not heating. A modern residential gas forced-air furnace with closed plain unbranded access panels, professionally connected realistic galvanized supply and return ductwork, in a clean, ordinary American basement utility room. Intact equipment, tidy unobstructed floor and service space, believable piping and venting, no cutaways, no visible flame, no exposed electrical parts. Natural window light, realistic materials, premium but authentic commercial photography, balanced wide composition keeping the furnace fully visible. No people. No text, numbers, labels, logos, brand marks, certification badges, or watermark. This is an illustrative scene, not a documented installation. Output a single image, preferably 1600x900 or larger 16:9.
```

## Filter comparison — exact prompt

```text
Use case: photorealistic-natural. One original landscape 16:9 educational editorial HVAC photograph. Close-up side-by-side comparison of two identical-size pleated residential furnace air filters lying next to each other on a clean neutral workbench: left filter visibly clogged with ordinary gray dust and lint in its pleats, right replacement filter clean white pleats. Both rectangular filters have realistic thin plain cardboard frames, same dimensions and construction. Clear visual distinction, both fully visible with small breathing room, subtle natural side lighting, realistic fiber and dust texture, no exaggerated mold or insects. Clean premium commercial photography, restrained neutral background. No person, no furnace disassembly, no text, printed labels, words, numbers, logos, watermarks or dividing graphics. No arrows. Output one image, preferably 1600x900 or larger 16:9.
```

## Winter vent — exact prompt

```text
Use case: photorealistic-natural. Create one landscape 16:9 educational editorial photograph for a Northeast US winter furnace-safety article. Ground-level view of the exterior wall of an ordinary American home in winter, showing a plausible plain white PVC sidewall furnace vent termination with a downward-facing intake elbow, securely attached, and a separate exhaust termination higher and offset, visible but secondary. A deep freshly wind-drifted snowbank has risen around the lower intake and partially obstructs its downward opening. Clearly show the snow obstruction as a winter hazard, not as a recommended installation or acceptable clearance. Modest frost, textured natural snow, siding and foundation, overcast natural daylight. Focus on the lower vent mouth and accumulating snow. No people clearing snow, no hands, no ladder, no roof, no tools, no disassembled or broken pipes. No nearby window, door, gas meter, exposed wire, or bizarre pipe arrangement. Technically plausible, restrained realistic commercial photography, not a technical installation diagram. No text, logos, labels, arrows or watermark. Single original image, preferably 1600x900 or larger 16:9.
```

## Professional inspection — exact selected prompt

```text
Use case: photorealistic-natural. Single original wide 16:9 American residential HVAC editorial photograph. A service professional wearing a plain navy work shirt and clear safety glasses stands beside a modern unbranded gray furnace with closed access panels, examining the exterior cabinet and connected galvanized supply duct with a small handheld flashlight. A second compact plain inspection instrument is held naturally at waist level, screen turned away from camera. Natural commercial photography, clean basement utility room, soft daylight, realistic skin and hands, no posing at camera. Camera positioned squarely toward front of closed furnace and professional at left, framed from waist up; show connected upper ductwork. The furnace side and all gas piping, valves and electrical connections are OUT OF FRAME; no intricate piping invented, no exposed combustion chamber, no opened panels, no repairs being performed. No logos, text, labels, brands, certification badges, watermark, visible numerals or readable screens. Generic AI illustrative service scene, not an Apex employee or actual installation. Balanced 16:9 composition, ideally 1600x900 or larger.
```

## Review boundaries

All four selected images were visually inspected. They match their intended subjects and do not display readable company branding, fabricated badges, or an invasive homeowner repair. Captions explicitly identify AI generation; the winter image is labeled a hazard illustration, not an installation guide. Illustrative equipment layouts do not certify an installation's code compliance or establish anyone's professional qualifications. Final HVAC/editorial image approval remains a publication prerequisite.

Originals and derivatives are under `public/` as requested. They are directly addressable assets if deployed; draft privacy applies to the article route, content listing, metadata and sitemap, not to access control on these image files. No deployment was performed.
