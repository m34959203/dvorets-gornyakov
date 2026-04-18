"use client";

import { useState } from "react";

interface FAQItem { q: string; a: string }

export default function RentFAQ({ title, items }: { title: string; items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
        <dl className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="py-4">
                <dt>
                  <button onClick={() => setOpen(isOpen ? null : i)}
                          className="flex w-full items-center justify-between text-left"
                          aria-expanded={isOpen}>
                    <span className="text-base font-semibold text-gray-900">{item.q}</span>
                    <svg className={"h-5 w-5 shrink-0 text-gray-500 transition " + (isOpen ? "rotate-180" : "")}
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </dt>
                {isOpen && (
                  <dd className="mt-3 pr-9 text-sm leading-relaxed text-gray-600">{item.a}</dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
