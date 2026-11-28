# Resource image assets

Article 1 now has four original AI-generated photographic illustrations, visibly disclosed in captions. Original PNGs and 1600 x 900 WebPs are stored under `public/resources/furnace-not-heating-common-problems/`; see [image provenance and prompts](editorial/ARTICLE_1_IMAGE_PROMPTS.md). The other four articles have no supplied imagery. There are no fabricated placeholder image URLs in the draft records. The public empty state uses a labeled, decorative inline house drawing; it does not claim to be a photograph.

When approved images are available, use local files with this convention:

| Article | Featured asset (other four are planned, not present yet) |
| --- | --- |
| Furnace (delivered) | `furnace-not-heating-common-problems/residential-gas-furnace-hero.webp` |
| Frozen pipes | `how-to-prevent-frozen-pipes-in-winter/featured.webp` |
| Water heater | `water-heater-warning-signs/featured.webp` |
| Heating bills | `why-are-heating-bills-so-high/featured.webp` |
| Appliances | `repair-or-replace-home-appliances/featured.webp` |

Use `/resources/<slug>/featured.webp` in content and `<descriptive-subject>.webp` for inline images. Prefer a 1600 x 900 featured image with its focal point inside the center crop. Supply the actual intrinsic width and height; write alt text describing the actual image, not a keyword list. WebP, AVIF, JPEG and PNG are supported. Keep licensing/source evidence with the editorial work, outside public assets.

Featured/card images reserve a 16:9 area, use `next/image`, responsive sizes, object-cover and lazy loading. The featured article/detail hero is preloaded; inline images stay lazy. Check the crop at mobile and desktop widths before publishing. Do not add a record referring to a filename until the asset exists.
