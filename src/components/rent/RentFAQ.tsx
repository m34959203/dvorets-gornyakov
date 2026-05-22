"use client";

import { useState } from "react";
import DgIcon from "@/components/layout/DgIcon";

interface FAQItem {
  q: string;
  a: string;
}

export default function RentFAQ({ title, items }: { title: string; items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <div>
      <div className="section-bar" style={{ marginBottom: 32 }}>
        <div className="tag">— FAQ —</div>
        <h2
          className="h2"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>
      <dl
        style={{
          borderTop: "1px solid var(--dg-hair)",
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{ borderBottom: "1px solid var(--dg-hair)" }}
            >
              <dt>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    paddingBlock: 18,
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--dg-text)",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.5 }}>
                    {item.q}
                  </span>
                  <span
                    style={{
                      color: "var(--dg-accent)",
                      flex: "none",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .2s",
                    }}
                  >
                    <DgIcon name="chev-d" size={18} />
                  </span>
                </button>
              </dt>
              {isOpen && (
                <dd
                  style={{
                    margin: 0,
                    paddingBottom: 18,
                    paddingRight: 36,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--dg-text-2)",
                  }}
                >
                  {item.a}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
