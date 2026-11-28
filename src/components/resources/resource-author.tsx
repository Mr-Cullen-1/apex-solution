import type { ResourceAuthor as Author } from "@/types/resource";

export function ResourceAuthor({ author }: { author: Author }) {
  return <span>By {author.name}</span>;
}
