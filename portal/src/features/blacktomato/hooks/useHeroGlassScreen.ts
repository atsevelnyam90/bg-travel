"use client";

import { useEffect, useId, useRef } from "react";
import { createLiquidGlassLens, GLASS_PADDING } from "../liquidGlassLens";

export function useHeroGlassScreen() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const mapRef = useRef<SVGFEImageElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    const filter = filterRef.current;
    const map = mapRef.current;
    const hero = button?.closest(".section--hero-banner");
    const context = canvas?.getContext("2d");
    if (!button || !canvas || !filter || !map || !hero || !context) return;

    const videos = Array.from(hero.querySelectorAll("video"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let lastPaint = 0;
    let version = 0;
    let lensSize = "";

    const paint = (time: number) => {
      frame = requestAnimationFrame(paint);
      if (time - lastPaint < 1000 / 30) return;
      lastPaint = time;

      const video = videos.find((item) => item.getBoundingClientRect().width > 0);
      if (!video || video.readyState < 2 || !video.videoWidth) {
        canvas.style.opacity = "0";
        return;
      }

      const rect = button.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (!width || !height) return;
      const size = `${width}:${height}`;
      if (size !== lensSize) {
        const lens = createLiquidGlassLens(width, height);
        if (!lens) return;
        canvas.width = width + GLASS_PADDING * 2;
        canvas.height = height + GLASS_PADDING * 2;
        map.setAttribute("href", lens);
        map.setAttribute("width", String(canvas.width));
        map.setAttribute("height", String(canvas.height));
        lensSize = size;
      }

      // Sample the currently displayed frame with the hero's centered object-fit: cover crop.
      // A cloned <video> would start its own playback and drift out of sync.
      const scene = video.getBoundingClientRect();
      const scale = Math.max(scene.width / video.videoWidth, scene.height / video.videoHeight);
      const left = scene.left + (scene.width - video.videoWidth * scale) / 2;
      const top = scene.top + (scene.height - video.videoHeight * scale) / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        video,
        (rect.left - GLASS_PADDING - left) / scale,
        (rect.top - GLASS_PADDING - top) / scale,
        canvas.width / scale,
        canvas.height / scale,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // Refresh the filter identity so WebKit also repaints the moving refracted frame.
      filter.id = `hero-glass-${id}-${++version}`;
      canvas.style.filter = `url(#${filter.id})`;
      canvas.style.opacity = "1";
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(paint);
      } else {
        canvas.style.opacity = "0";
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(button);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [id]);

  return { buttonRef, canvasRef, filterRef, mapRef };
}
