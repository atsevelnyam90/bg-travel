"use client";

import { useTranslations } from "next-intl";
import { useHeroTextGlassScreen } from "../hooks/useHeroTextGlassScreen";
import "./heroCopy.css";

function HeroGlassText({ text, depth }: { text: string; depth: number }) {
  const { rootRef, textRef, surfaceRef, edgeRef, canvasRef, filterRef, mapRef } =
    useHeroTextGlassScreen();

  return (
    <div ref={rootRef} className="fx-glass">
      <span ref={surfaceRef} className="hero-copy__glass" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-copy__refraction" />
        <span className="hero-copy__frost" />
        <span className="hero-copy__sheen" />
        <span ref={edgeRef} className="hero-copy__edge" />
      </span>
      <span ref={textRef} className="hero-copy__text">
        {text}
      </span>
      <svg className="hero-copy__filters" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <filter
            ref={filterRef}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage ref={mapRef} x="0" y="0" preserveAspectRatio="none" result="lens" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens"
              scale={depth}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export function BlackTomatoHeroCopy() {
  const t = useTranslations("publicHero");

  return (
    <>
      <div className="hero-copy__title">
        <HeroGlassText text={t("title")} depth={16} />
      </div>
      <div className="hero-copy__description">
        <HeroGlassText text={t("description")} depth={7} />
      </div>
    </>
  );
}
