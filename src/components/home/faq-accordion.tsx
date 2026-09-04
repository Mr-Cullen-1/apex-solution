"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { FAQ } from "@/types/content";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="border-t border-navy">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <div key={item.id} className="border-b border-steel">
            <h3>
              <button id={buttonId} type="button" className="flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold tracking-[-0.02em] text-navy sm:min-h-24 sm:text-xl" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)}>
                {item.question}
                <span className={`grid size-9 shrink-0 place-items-center border border-steel transition duration-300 ${open ? "rotate-180 border-navy bg-navy text-white" : ""}`}><ChevronDownIcon className="size-4" /></span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden"><p className="max-w-2xl pb-7 pr-12 text-base leading-7 text-slate sm:pb-9">{item.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
