"use client";

import { useTranslations } from "next-intl";
import styles from "./header.module.css";
import { PublicLocaleSwitcher } from "./PublicLocaleSwitcher";
import { TravelThemeSwitcher } from "./TravelThemeSwitcher";

export function BlackTomatoHeaderMarkup() {
  const t = useTranslations("publicHeader");

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a href="/" aria-label={t("home")} className={styles.logo}>
          <img src="/bg-travel/logo.png" alt="BG Travel" width="247" height="266" />
        </a>
        <nav aria-label={t("mainNavigation")} className={styles.actions}>
          <a href="tel:+442074269888" className={styles.phone}>
            +44 207 426 9888
          </a>
          <PublicLocaleSwitcher />
          <TravelThemeSwitcher />
          <a
            href="#journey-start"
            className={`btn btn--pink btn--inverse btn--3dless btn--rounded js-start-journey ${styles.booking}`}
            rel="nofollow"
          >
            {t("book")}
          </a>
        </nav>
      </div>
    </header>
  );
}
