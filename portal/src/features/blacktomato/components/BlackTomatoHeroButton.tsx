"use client";

import { Button } from "@/components/ui/button";
import { useHeroGlassScreen } from "../hooks/useHeroGlassScreen";
import styles from "./heroButton.module.css";

export function BlackTomatoHeroButton() {
  const { buttonRef, canvasRef, filterRef, mapRef } = useHeroGlassScreen();

  return (
    <Button asChild variant="ghost" className={styles.button}>
      <a ref={buttonRef} className="js-explore-trips" href="#journey-start">
        <span className={styles.glass} aria-hidden="true">
          <canvas ref={canvasRef} className={styles.refraction} />
          <span className={styles.sheen} />
        </span>
        <svg width="0" height="0" className={styles.filters} aria-hidden="true" focusable="false">
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
                scale="30.6"
                xChannelSelector="R"
                yChannelSelector="G"
                result="red"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lens"
                scale="29.4"
                xChannelSelector="R"
                yChannelSelector="G"
                result="blue"
              />
              <feColorMatrix
                in="red"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="redChannel"
              />
              <feColorMatrix
                in="blue"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="blueGreenChannels"
              />
              <feComposite
                in="redChannel"
                in2="blueGreenChannels"
                operator="arithmetic"
                k2="1"
                k3="1"
              />
            </filter>
          </defs>
        </svg>
        <span className={styles.label}>Аяллаа төлөвлөх</span>
      </a>
    </Button>
  );
}
