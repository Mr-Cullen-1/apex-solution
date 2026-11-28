# Client article source extraction

The read-only extraction input is `C:\Users\User\Downloads\Telegram Desktop\Untitled.docx` (32,381 bytes), SHA-256 `694104eaf150b49f1a798e4c1d3ac387c7fc398a32086fc6ef095784484be2c4`. The source was not modified.

Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-client-articles.ps1` from the repository root to reproduce the extraction. No document text is executed or treated as implementation instructions.

The source contains all 13 requested articles, 505 top-level paragraphs, 13 metadata tables, 9 body tables, 143 list items (78 bullet and 65 decimal), 55 FAQ entries, 6 external source hyperlinks, and no embedded images. Article body text contains 11,456 whitespace-delimited words, including headings, lists, tables, FAQs, CTAs, and source labels; article H1 and SEO metadata are separate fields and are not included in this body word count.

`src/content/resources/client-articles-source.json` is the integration artifact. `source-structure.json` preserves every body XML block, including document context and article separator labels. The eight archive XML parts are retained here with slash separators replaced by double underscores. `source-transcript.txt` is an indexed, readable transcript. `extraction-validation.json` records comparisons of each serialized body paragraph, rich-text run and table cell against the original XML text, including regenerated `bodyPlainText`.

The normalized article schema is `{number, slug, urlSlug, seoTitle, title, titleRuns, metaDescription, keywordsText, keywords, metadataRows, sourceRange, bodyPlainText, counts, blocks}`. Blocks retain source indices. Paragraph-like blocks have `type`, `text`, `runs`, and original `style`; headings add `level`; list items add `{numId, level, format, start, marker}`. Tables have `rows[].cells[]`, with each cell retaining `text`, `blocks`, and `colSpan`. Runs are flat arrays with `text`, `bold`, `italic`, `underline`, and optional original `href`. FAQ questions are the bold initial run of paragraphs beneath the exact `Frequently asked questions` heading; FAQ answers remain in the same paragraph. Each article has four FAQs except the furnace article (five) and refrigerator article (six).

## Source observations requiring no wording changes

- The document context reads `Nov 27, 2026 · @Cameron`. This is retained as provenance, not used as the website article author or implementation publication date.
- The source supplies phone `(516) 586-0826`, Monday-to-Friday 9 AM-to-6 PM hours, $89 starting service-call claims, same-day diagnostic-fee credits, 10+ years of technician experience, and, for some commercial articles, EPA 608 certification claims. Extraction preserves these supplied claims and does not independently verify them.
- The source says `See our boiler repair page.` (source index 8), `See our heating maintenance page.` (44), and `See our guide on how often to clean a commercial ice machine.` (506), but does not provide embedded hyperlinks for those references. They remain exact original text; route mapping is an implementation decision.
- Only five articles have explicit Sources sections: refrigerator, commercial refrigerator (two sources), walk-in cooler, commercial ice-machine cleaning, and commercial freezer. No sources were invented for the other eight.
- Gas-emergency instructions differ across articles: the furnace passage (9) says not to flip switches, use the thermostat, or unplug anything, while the residential-oven passage (276) says to turn the oven off if it can be done immediately and the commercial-oven passage (426) says to shut off gas if it can be done immediately. These passages are preserved verbatim and should be considered together in any future editorial/safety review; this extraction makes no technical correction or external verification claim.
- Source article labels and source URL slugs differ in descriptive scope in places (for example, washer includes spinning, walk-in includes freezer, and refrigerator ice maker uses `/blog/ice-maker-not-working`). All 13 source URL slugs match the requested slug list exactly.

No headings, body wording, lists, table cells, FAQ answers, CTA wording, source labels or provided URLs were rewritten.
