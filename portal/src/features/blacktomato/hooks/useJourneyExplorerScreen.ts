"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/lib/useBreakpoint";

export type JourneyCategoryId = "domestic" | "international" | "wedding";

export function useJourneyExplorerScreen() {
  const isMobile = useIsMobile();
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<JourneyCategoryId | null>(null);
  const [selectedTripTitle, setSelectedTripTitle] = useState<string | null>(null);
  const [canScrollTripsBack, setCanScrollTripsBack] = useState(false);
  const [canScrollTripsForward, setCanScrollTripsForward] = useState(false);
  const openingFrameRef = useRef<number | null>(null);
  const selectedTripCountRef = useRef(0);
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
    if (selectedCategoryId === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (tripViewportRef.current) {
        tripViewportRef.current.scrollLeft = 0;
      }
      setCanScrollTripsBack(false);
      setCanScrollTripsForward(selectedTripCountRef.current > (isMobile ? 1 : 3));
    });

    return () => cancelAnimationFrame(frame);
  }, [isMobile, selectedCategoryId]);

  useEffect(() => {
    if (!selectedTripTitle) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document.getElementById("trip-detail")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedTripTitle]);

  const syncTripNavigation = () => {
    const viewport = tripViewportRef.current;
    if (!viewport) {
      return;
    }

    setCanScrollTripsBack(viewport.scrollLeft > 2);
    setCanScrollTripsForward(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 2);
  };

  return {
    canScrollTripsBack,
    canScrollTripsForward,
    closeCategory: () => {
      cancelPendingOpen();
      setCategoryOpen(false);
      setSelectedTripTitle(null);
    },
    closeTrip: () => setSelectedTripTitle(null),
    isCategoryOpen,
    isMobile,
    openCategory: (categoryId: JourneyCategoryId, tripCount: number) => {
      cancelPendingOpen();
      setCategoryOpen(false);
      setSelectedTripTitle(null);
      selectedTripCountRef.current = tripCount;
      setSelectedCategoryId(categoryId);
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
    openTrip: (title: string) => setSelectedTripTitle(title),
    selectedCategoryId,
    selectedTripTitle,
    syncTripNavigation,
    tripViewportRef,
  };
}
