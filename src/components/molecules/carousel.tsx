"use client";

import {
  Children,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface CarouselHandle {
  scrollPrev: () => void;
  scrollNext: () => void;
}

export interface CarouselState {
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

export interface CarouselProps {
  children: ReactNode[];
  className?: string;
  hideArrows?: boolean;
  onStateChange?: (state: CarouselState) => void;
  /** Overrides each slide's width classes (default: full width, 50% from sm, 33.333% from lg). */
  itemClassName?: string;
}

function computeStops(track: HTMLDivElement): number[] {
  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
  const children = Array.from(track.children) as HTMLElement[];
  const stops: number[] = [];
  for (const child of children) {
    const target = Math.min(child.offsetLeft, maxScrollLeft);
    if (stops.length === 0 || target - stops[stops.length - 1] > 1) {
      stops.push(target);
    }
  }
  return stops.length > 0 ? stops : [0];
}

export const Carousel = forwardRef<CarouselHandle, CarouselProps>(
  function Carousel(
    {
      children,
      className = "",
      hideArrows = false,
      onStateChange,
      itemClassName = "w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]",
    },
    ref,
  ) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [stops, setStops] = useState<number[]>([0]);
    const [activeStop, setActiveStop] = useState(0);
    const activeStopRef = useRef(0);
    const stopsRef = useRef<number[]>([0]);
    const items = Children.toArray(children);

    useLayoutEffect(() => {
      const track = trackRef.current;
      if (!track) return;

      function recomputeStops() {
        if (!track) return;
        const next = computeStops(track);
        stopsRef.current = next;
        setStops(next);
      }

      recomputeStops();

      const observer = new ResizeObserver(recomputeStops);
      observer.observe(track);
      return () => observer.disconnect();
    }, [items.length]);

    function scrollToStop(index: number) {
      const targets = stopsRef.current;
      const clamped = Math.max(0, Math.min(targets.length - 1, index));
      activeStopRef.current = clamped;
      setActiveStop(clamped);
      trackRef.current?.scrollTo({
        left: targets[clamped],
        behavior: "smooth",
      });
    }

    function handleScroll() {
      const track = trackRef.current;
      if (!track) return;
      const targets = stopsRef.current;
      let closest = 0;
      let minDistance = Infinity;
      targets.forEach((target, index) => {
        const distance = Math.abs(target - track.scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });
      activeStopRef.current = closest;
      setActiveStop(closest);
    }

    useImperativeHandle(ref, () => ({
      scrollPrev: () => scrollToStop(activeStopRef.current - 1),
      scrollNext: () => scrollToStop(activeStopRef.current + 1),
    }));

    const canScroll = stops.length > 1;

    useEffect(() => {
      onStateChange?.({
        canScrollPrev: canScroll && activeStop > 0,
        canScrollNext: canScroll && activeStop < stops.length - 1,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canScroll, activeStop, stops.length]);

    const showControls = canScroll;

    return (
      <div className={`relative ${className}`}>
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <div key={index} className={itemClassName}>
              {item}
            </div>
          ))}
        </div>

        {showControls && !hideArrows && (
          <>
            <button
              type="button"
              onClick={() => scrollToStop(activeStopRef.current - 1)}
              aria-label="Previous"
              disabled={activeStop === 0}
              className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary absolute top-1/2 left-0 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
            >
              <Icon icon={ChevronLeft} size="sm" />
            </button>
            <button
              type="button"
              onClick={() => scrollToStop(activeStopRef.current + 1)}
              aria-label="Next"
              disabled={activeStop === stops.length - 1}
              className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary absolute top-1/2 right-0 flex size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
            >
              <Icon icon={ChevronRight} size="sm" />
            </button>
          </>
        )}

        {showControls && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {stops.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToStop(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeStop}
                className={`size-1.5 rounded-full transition-colors ${
                  index === activeStop ? "bg-primary" : "bg-border-hover"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
