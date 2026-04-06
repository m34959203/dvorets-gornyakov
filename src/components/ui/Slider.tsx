"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  children: ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export default function Slider({ children, autoPlay = true, interval = 5000, className }: SliderProps) {
  const [current, setCurrent] = useState(0);
  const total = children.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, total]);

  if (total === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="relative w-full">
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              "w-full transition-opacity duration-700",
              index === current ? "block opacity-100 hero-slide" : "hidden opacity-0"
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === current ? "bg-white scale-125" : "bg-white/50"
                )}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
