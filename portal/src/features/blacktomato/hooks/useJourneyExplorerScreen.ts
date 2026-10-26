"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/lib/useBreakpoint";

export type JourneyCategoryId = "domestic" | "international" | "wedding";

type JourneyExplorerOptions = {
  initialCategoryId?: JourneyCategoryId | null;
  onCategoryChange?: (categoryId: JourneyCategoryId | null) => void;
  tripCounts: Record<JourneyCategoryId, number>;
};

export function useJourneyExplorerScreen({
  initialCategoryId = null,
  onCategoryChange,
  tripCounts,
}: JourneyExplorerOptions) {
  const isMobile = useIsMobile();
  const [isCategoryOpen, setCategoryOpen] = useState(initialCategoryId !== null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<JourneyCategoryId | null>(
    initialCategoryId,
  );
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [canScrollTripsBack, setCanScrollTripsBack] = useState(false);
  const [canScrollTripsForward, setCanScrollTripsForward] = useState(false);
  const openingFrameRef = useRef<number | null>(null);
  const tripViewportRef = useRef<HTMLDivElement>(null);

  const cancelPendingOpen = () => {
    if (openingFrameRef.current !== null) {
      cancelAnimationFrame(openingFrameRef.current);
      openingFrameRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (openingFrameRef.current !== null) {
        cancelAnimationFrame(openingFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isMobileFilterOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFilterOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileFilterOpen]);

  useEffect(() => {
    if (selectedCategoryId === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (tripViewportRef.current) {
        tripViewportRef.current.scrollLeft = 0;
      }
      setCanScrollTripsBack(false);
      setCanScrollTripsForward(tripCounts[selectedCategoryId] > (isMobile ? 1 : 3));
    });

    return () => cancelAnimationFrame(frame);
  }, [isMobile, selectedCategoryId, tripCounts]);

  const syncTripNavigation = () => {
    const viewport = tripViewportRef.current;
    if (!viewport) {
      return;
    }

    setCanScrollTripsBack(viewport.scrollLeft > 2);
    setCanScrollTripsForward(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 2);
  };

  const scrollToExplorerLevel = (
    elementId: "journey-explorer" | "trip-list",
    topOffset: number,
  ) => {
    requestAnimationFrame(() => {
      const target = document.getElementById(elementId);
      if (!target) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        behavior: isMobile || reduceMotion ? "instant" : "smooth",
        top: window.scrollY + target.getBoundingClientRect().top - topOffset,
      });
    });
  };

  return {
    canScrollTripsBack,
    canScrollTripsForward,
    closeCategory: () => {
      cancelPendingOpen();
      setCategoryOpen(false);
      setMobileFilterOpen(false);
      onCategoryChange?.(null);
      scrollToExplorerLevel("journey-explorer", isMobile ? 68 : 84);
    },
    closeMobileFilter: () => setMobileFilterOpen(false),
    isCategoryOpen,
    isMobile,
    isMobileFilterOpen,
    openMobileFilter: () => setMobileFilterOpen(true),
    openCategory: (categoryId: JourneyCategoryId) => {
      cancelPendingOpen();
      setCategoryOpen(false);
      setSelectedCategoryId(categoryId);
      onCategoryChange?.(categoryId);
      openingFrameRef.current = requestAnimationFrame(() => {
        openingFrameRef.current = requestAnimationFrame(() => {
          openingFrameRef.current = null;
          setCategoryOpen(true);
        });
      });
    },
    scrollTrips: (direction: -1 | 1) => {
      const viewport = tripViewportRef.current;
      if (!viewport) {
        return;
      }

      viewport.scrollBy({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        left: direction * viewport.clientWidth,
      });
    },
    selectedCategoryId,
    syncTripNavigation,
    tripViewportRef,
  };
}
