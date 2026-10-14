"use client";

import { useEffect, useRef, useState } from "react";

export function useWelcomeScreen() {
  const [entered, setEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [paused, setPaused] = useState(false);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (entered) {
      window.scrollTo(0, 0);
      content.current?.focus({ preventScroll: true });
    }
  }, [entered]);

  return {
    entered,
    content,
    playing: !reducedMotion && !paused,
    enter: () => setEntered(true),
    togglePlayback: () => setPaused((value) => !value),
    reducedMotion,
  };
}
