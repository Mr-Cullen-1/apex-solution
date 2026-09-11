import { StarIcon } from "@/components/ui/icons";

/** Read-only star display for an already-submitted rating (1-5). Individual
 * icons are decorative (`StarIcon` already sets `aria-hidden`); the wrapper
 * carries the one accessible label a screen reader actually needs. */
export function StarRating({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`${rating} out of 5 stars`} className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} className={`size-4 ${index < rating ? "text-copper" : "text-steel"}`} />
      ))}
    </div>
  );
}
