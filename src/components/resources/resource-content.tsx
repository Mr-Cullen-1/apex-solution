import Link from "next/link";
import { ResourceImage } from "./resource-image";
import { ResourceCTA } from "./resource-cta";
import { isApprovedResourceSource } from "@/content/resources/sources";
import type { ResourceBlock, ResourceInline, ResourceListBlock } from "@/types/resource";

export function ResourceText({ parts }: { parts: readonly ResourceInline[] }) {
  return <>{parts.map((part, index) => {
    let text = <>{part.text}</>;
    if (part.bold) text = <strong>{text}</strong>;
    if (part.italic) text = <em>{text}</em>;
    if (part.underline) text = <span className="underline">{text}</span>;
    if (part.type === "text") return <span key={index}>{text}</span>;
    const className = "font-medium text-brand-primary underline underline-offset-4";
    return isApprovedResourceSource(part.href)
      ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className={className}>{text}<span className="sr-only"> (opens in a new tab)</span></a>
      : part.href.startsWith("tel:") ? <a key={index} href={part.href} className={className}>{text}</a>
      : <Link key={index} href={part.href} className={className}>{text}</Link>;
  })}</>;
}

function ResourceList({ block }: { block: ResourceListBlock }) {
  const Tag = block.ordered ? "ol" : "ul";
  return <Tag {...(block.ordered ? { start: block.start } : {})}>{block.items.map((item, index) => <li key={index}><ResourceText parts={item} />{block.nested?.[index]?.map((nested, nestedIndex) => <ResourceList key={nestedIndex} block={nested} />)}</li>)}</Tag>;
}

export function ResourceContent({ blocks }: { blocks: readonly ResourceBlock[] }) {
  return <div className="resource-prose">{blocks.map((block, index) => {
    switch (block.type) {
      case "heading": return block.level === 2 ? <h2 key={block.id} id={block.id}>{block.text}</h2> : <h3 key={block.id} id={block.id}>{block.text}</h3>;
      case "paragraph": return <p key={index}><ResourceText parts={block.children} /></p>;
      case "list": return <ResourceList key={index} block={block} />;
      case "quote": return <blockquote key={index} className="resource-callout"><p><ResourceText parts={block.children} /></p></blockquote>;
      case "table": return <div key={index} className="resource-table-wrap" role="region" aria-label="Article reference table" tabIndex={0}><table><thead><tr>{block.rows[0]?.cells.map((cell, i) => <th key={i} scope="col" colSpan={cell.colSpan}><ResourceText parts={cell.children} /></th>)}</tr></thead><tbody>{block.rows.slice(1).map((row, i) => <tr key={i}>{row.cells.map((cell, j) => <td key={j} colSpan={cell.colSpan}><ResourceText parts={cell.children} /></td>)}</tr>)}</tbody></table></div>;
      case "image": return <figure key={index}><ResourceImage image={block.image} alt={block.alt} sizes="(max-width: 1023px) 100vw, 768px" />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
      case "callout": return <aside key={index} className="resource-callout"><p className="eyebrow">{block.tone === "warning" ? "Important precaution" : block.tone === "tip" ? "Homeowner tip" : "Good to know"}</p><p className="font-semibold text-navy">{block.title}</p><p><ResourceText parts={block.children} /></p></aside>;
      case "cta": return <ResourceCTA key={index} title={block.title} description={block.description} />;
    }
  })}</div>;
}
