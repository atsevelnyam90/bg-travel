"use client";

import { useEffect, useId, useRef } from "react";
import { createHeroTextLens, TEXT_GLASS_PADDING } from "../heroTextLens";

export function useHeroTextGlassScreen() {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const mapRef = useRef<SVGFEImageElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const surface = surfaceRef.current;
    const edge = edgeRef.current;
    const canvas = canvasRef.current;
    const filter = filterRef.current;
    const map = mapRef.current;
    const hero = root?.closest(".section--hero-banner");
    const context = canvas?.getContext("2d");
    if (!root || !text || !surface || !edge || !canvas || !filter || !map || !hero || !context)
      return;

    const videos = Array.from(hero.querySelectorAll("video"));
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    let dirty = true;
    let frame = 0;
    let lastPaint = 0;
    let version = 0;

    const paint = (time: number) => {
      frame = requestAnimationFrame(paint);
      if (time - lastPaint < 1000 / 30) return;
      lastPaint = time;
      const video = videos.find((item) => item.getBoundingClientRect().width > 0);
      if (!video || video.readyState < 2 || !video.videoWidth) {
        delete root.dataset.glassReady;
        return;
      }
      if (dirty) {
        const lens = createHeroTextLens(text);
        if (!lens) return;
        canvas.width = lens.width + TEXT_GLASS_PADDING * 2;
        canvas.height = lens.height + TEXT_GLASS_PADDING * 2;
        surface.style.maskImage = `url("${lens.mask}")`;
        surface.style.webkitMaskImage = `url("${lens.mask}")`;
        edge.style.maskImage = `url("${lens.edge}")`;
        edge.style.webkitMaskImage = `url("${lens.edge}")`;
        map.setAttribute("href", lens.map);
        map.setAttribute("width", String(canvas.width));
        map.setAttribute("height", String(canvas.height));
        dirty = false;
      }

      const rect = text.getBoundingClientRect();
      const scene = video.getBoundingClientRect();
      const scale = Math.max(scene.width / video.videoWidth, scene.height / video.videoHeight);
      const left = scene.left + (scene.width - video.videoWidth * scale) / 2;
      const top = scene.top + (scene.height - video.videoHeight * scale) / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        video,
        (rect.left - TEXT_GLASS_PADDING - left) / scale,
        (rect.top - TEXT_GLASS_PADDING - top) / scale,
        canvas.width / scale,
        canvas.height / scale,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      filter.id = `hero-text-glass-${id}-${++version}`;
      canvas.style.filter = `url(#${filter.id})`;
      root.dataset.glassReady = "true";
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(paint);
      } else {
        delete root.dataset.glassReady;
      }
    };
    const invalidate = () => {
      dirty = true;
    };
    const resize = new ResizeObserver(invalidate);
    resize.observe(text);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(root);
    document.fonts.ready.then(() => {
      if (!disposed) invalidate();
    });
    document.fonts.addEventListener("loadingdone", invalidate);
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.fonts.removeEventListener("loadingdone", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
      delete root.dataset.glassReady;
    };
  }, [id]);

  return { rootRef, textRef, surfaceRef, edgeRef, canvasRef, filterRef, mapRef };
}
