"use client";

import { useState } from "react";
import type { FAQ } from "@/types/content";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <div key={item.id} className={`rounded-panel border transition-colors ${open ? "border-navy bg-surface-soft" : "border-steel bg-surface"}`}>
            <h3>
              <button id={buttonId} type="button" className="flex min-h-16 w-full items-center justify-between gap-6 px-6 py-5 text-left text-base font-semibold tracking-[-0.01em] text-navy sm:text-lg" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)}>
                {item.question}
                <span className={`grid size-9 shrink-0 place-items-center rounded-control border transition-all duration-300 ${open ? "rotate-45 border-navy bg-navy text-white" : "border-steel text-navy"}`}><span aria-hidden="true" className="text-xl leading-none">+</span></span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden"><p className="max-w-2xl px-6 pb-6 text-base leading-7 text-slate">{item.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
