"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";

export type SelectOption = { value: string; label: string };

/** Minimal accessible "collapsible dropdown listbox" (WAI-ARIA pattern) — a
 * button trigger + a listbox popup, not a native `<select>`. Built here
 * rather than pulled from a library because the project has no existing
 * select/listbox/popover primitive and this is the only place one is
 * needed; a full generic component system would be overkill for one field.
 * Replaces the native select specifically because its open-state dropdown
 * renders raw OS chrome that breaks the Apex visual system — the trigger
 * itself matches every other field's height/border/radius/focus styling. */
export function ServiceSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  triggerClassName,
  ariaDescribedBy,
  ariaInvalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  triggerClassName: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}) {
  const allOptions: SelectOption[] = [{ value: "", label: placeholder }, ...options];
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = allOptions.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? allOptions[selectedIndex] : allOptions[0];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openList() {
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function selectOption(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openList();
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, allOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(allOptions.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(allOptions[highlightedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`${triggerClassName} flex items-center justify-between text-left`}
      >
        <span className={`truncate ${selected.value ? "text-navy" : "text-slate/65"}`}>{selected.label}</span>
        <ChevronDownIcon className={`size-4 shrink-0 text-slate transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${id}-option-${highlightedIndex}`}
          onKeyDown={handleListKeyDown}
          className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-card border border-steel bg-surface p-1.5 shadow-card focus:outline-none"
        >
          {allOptions.map((option, index) => (
            <li
              key={option.value || "placeholder"}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption(option)}
              className={`flex cursor-pointer items-center justify-between rounded-control px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex ? "bg-brand-soft text-navy" : "text-navy"
              }`}
            >
              <span className={option.value ? "" : "text-slate/65"}>{option.label}</span>
              {option.value === value && <CheckIcon className="size-4 shrink-0 text-copper" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
