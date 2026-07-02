"use client";

import { Children, ReactNode, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface CarouselProps {
  children: ReactNode[];
  className?: string;
}

export function Carousel({ children, className = "" }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = Children.toArray(children);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    const child = track?.children[index] as HTMLElement | undefined;
    if (track && child) {
      track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    }
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    let closest = 0;
    let minDistance = Infinity;
    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - track.scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });
    setActiveIndex(closest);
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            {item}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            aria-label="Previous"
            disabled={activeIndex === 0}
            className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary absolute top-1/2 left-0 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
          >
            <Icon icon={ChevronLeft} size="sm" />
          </button>
          <button
            type="button"
            onClick={() =>
              scrollToIndex(Math.min(items.length - 1, activeIndex + 1))
            }
            aria-label="Next"
            disabled={activeIndex === items.length - 1}
            className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary absolute top-1/2 right-0 flex size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
          >
            <Icon icon={ChevronRight} size="sm" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                className={`size-1.5 rounded-full transition-colors ${
                  index === activeIndex ? "bg-primary" : "bg-border-hover"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
