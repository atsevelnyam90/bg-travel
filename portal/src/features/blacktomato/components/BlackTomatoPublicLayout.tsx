import type { ReactNode } from "react";
import { PublicI18nProvider } from "@/lib/i18n/PublicI18nProvider";
import { BlackTomatoBodyClass } from "./BlackTomatoBodyClass";
import { BlackTomatoHeaderMarkup } from "./BlackTomatoHeaderMarkup";
import { BlackTomatoLocalizedShell } from "./BlackTomatoLocalizedShell";
import {
  BLACK_TOMATO_BODY_CLASS,
  BLACK_TOMATO_CSS,
  BLACK_TOMATO_FONTS,
} from "./blackTomatoConstants";
import styles from "./brand.module.css";
import typography from "./publicTypography.module.css";
import themes from "./travelThemes.module.css";

export function BlackTomatoPublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicI18nProvider>
      <BlackTomatoBodyClass className={BLACK_TOMATO_BODY_CLASS} />

      {BLACK_TOMATO_FONTS.map((href) => (
        <link key={href} rel="preload" as="font" href={href} />
      ))}

      {BLACK_TOMATO_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}

      <BlackTomatoLocalizedShell
        className={`${BLACK_TOMATO_BODY_CLASS} blacktomato-shell ${styles.brand} ${themes.theme} ${typography.scope}`}
      >
        <BlackTomatoHeaderMarkup bookingHref="/#journey-start" detail />
        {children}
      </BlackTomatoLocalizedShell>
    </PublicI18nProvider>
  );
}
