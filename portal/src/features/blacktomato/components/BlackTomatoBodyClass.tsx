"use client";

import { useEffect } from "react";

type BlackTomatoBodyClassProps = {
  className: string;
};

export function BlackTomatoBodyClass({ className }: BlackTomatoBodyClassProps) {
  useEffect(() => {
    const classes = className.split(/\s+/).filter(Boolean);

    document.body.classList.add(...classes);

    return () => {
      document.body.classList.remove(...classes);
    };
  }, [className]);

  return null;
}
