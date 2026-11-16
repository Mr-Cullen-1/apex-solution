type SearchableService = { name: string; shortDescription: string };

export function matchesServiceQuery(item: SearchableService, query: string): boolean {
  const terms = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const words = `${item.name} ${item.shortDescription}`.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return terms.every((term) => words.some((word) => word.startsWith(term)));
}
