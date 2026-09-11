"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseIcon, ImageIcon } from "@/components/ui/icons";
import { focusRing } from "./focus-ring";

/** Optional single-photo attachment. Deliberately not a plain
 * `<input type="file">` — the spec calls that out as "an ugly browser file
 * input" — but the real input is still the interactive element: a `<label>`
 * with `htmlFor` wraps the styled dropzone, and the input itself stays
 * keyboard-reachable (only visually hidden via `sr-only`, never
 * `tabIndex={-1}` — unlike the honeypot field elsewhere in this form, this
 * one must be genuinely operable by keyboard and screen reader). */
export function ImageUpload({
  id,
  file,
  onSelect,
  onRemove,
  error,
  ariaDescribedBy,
}: {
  id: string;
  file: File | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  error?: string;
  ariaDescribedBy?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  // One object URL per selected file — never read into React state as
  // base64. Created during render (not in an effect, which would need to
  // call setState from inside itself) and revoked whenever `file` changes
  // again or this unmounts.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFiles(files: FileList | null) {
    const selected = files?.[0];
    if (selected) onSelect(selected);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-steel bg-surface p-2.5">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob: object URL, not an optimizable remote/static asset
          <img src={previewUrl} alt="Selected review photo preview" className="size-14 shrink-0 rounded-control object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{file.name}</p>
          <p className="text-xs text-slate">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
        </div>
        <button
          id={id}
          type="button"
          onClick={onRemove}
          aria-label="Remove attached photo"
          className={`grid size-8 shrink-0 place-items-center rounded-control text-slate transition-colors hover:bg-page-bg hover:text-navy ${focusRing}`}
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`flex scroll-mt-28 cursor-pointer items-center gap-2.5 rounded-card border border-dashed px-3.5 py-2 text-sm outline-none transition-colors hover:border-slate/50 has-[:focus-visible]:border-brand-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-primary/20 ${
        isDragging ? "border-brand-primary bg-brand-soft" : "border-steel"
      }`}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-control bg-page-bg text-slate">
        <ImageIcon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-navy">
          Add a photo <span className="font-normal text-slate">Optional</span>
        </span>
        <span className="block text-xs text-slate">JPG, PNG or WEBP · max 5 MB</span>
      </span>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-describedby={ariaDescribedBy}
        aria-invalid={Boolean(error)}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}
