"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useWelcomeScreen } from "../hooks/useWelcomeScreen";
import styles from "./welcome.module.css";

export function WelcomeExperience({ children }: { children: ReactNode }) {
  const screen = useWelcomeScreen();

  if (screen.entered) {
    return (
      <div ref={screen.content} tabIndex={-1} className={styles.portal}>
        {children}
      </div>
    );
  }

  return (
    <section className={styles.welcome} aria-label="BG Travel — Тавтай морилно уу" lang="mn">
      {screen.playing && (
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/bg-travel/poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/bg-travel/background.mp4" type="video/mp4" />
        </video>
      )}
      <Button
        type="button"
        variant="ghost"
        className={styles.enter}
        onClick={screen.enter}
        aria-label="BG Travel вэбсайт руу нэвтрэх"
      />
      <div className={styles.content}>
        <Image
          className={styles.logo}
          src="/bg-travel/logo.png"
          alt="BG Travel"
          width={247}
          height={266}
          priority
        />
        <h1 className={styles.headline}>
          <Image
            src="/bg-travel/headline.png"
            alt="Хамгийн хямд, хамгийн чанартай аяллыг манайхаас..."
            width={988}
            height={53}
            priority
          />
        </h1>
        <p className={styles.tagline}>
          <Image
            src="/bg-travel/tagline.png"
            alt="Тээш дүүрэн дурсамжийг BG Travel-тай хамт"
            width={667}
            height={30}
            priority
          />
        </p>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            className={`${styles.action} ${styles.outline}`}
            onClick={screen.enter}
          >
            <Image src="/bg-travel/view-tours.png" alt="Аяллууд үзэх" width={210} height={28} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`${styles.action} ${styles.gradient}`}
            onClick={screen.enter}
          >
            <Image src="/bg-travel/plan-trip.png" alt="Аяллаа төлөвлөх" width={269} height={22} />
          </Button>
        </div>
        <p className={styles.hint}>Үргэлжлүүлэхийн тулд дэлгэц дээр дарна уу</p>
      </div>
      {!screen.reducedMotion && (
        <Button
          type="button"
          variant="ghost"
          className={styles.playback}
          onClick={screen.togglePlayback}
        >
          {screen.playing ? "Видеог түр зогсоох" : "Видеог тоглуулах"}
        </Button>
      )}
    </section>
  );
}
