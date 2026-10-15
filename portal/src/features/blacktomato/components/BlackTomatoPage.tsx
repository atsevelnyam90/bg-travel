import { PublicI18nProvider } from "@/lib/i18n/PublicI18nProvider";
import { BlackTomatoBodyClass } from "./BlackTomatoBodyClass";
import { BlackTomatoHomeMarkup } from "./BlackTomatoHomeMarkup";
import { BlackTomatoInteractions } from "./BlackTomatoInteractions";
import {
  BLACK_TOMATO_BODY_CLASS,
  BLACK_TOMATO_CSS,
  BLACK_TOMATO_FONTS,
} from "./blackTomatoConstants";
import styles from "./brand.module.css";
import themes from "./travelThemes.module.css";

export function BlackTomatoPage() {
  return (
    <PublicI18nProvider>
      <BlackTomatoBodyClass className={BLACK_TOMATO_BODY_CLASS} />
      <BlackTomatoInteractions />

      {BLACK_TOMATO_FONTS.map((href) => (
        <link key={href} rel="preload" as="font" href={href} />
      ))}

      {BLACK_TOMATO_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}

      <style>{`
        .blacktomato-shell:not(.blacktomato-shell--started) .section--hero-banner ~ .section,
        .blacktomato-shell:not(.blacktomato-shell--started) > .bar,
        .blacktomato-shell:not(.blacktomato-shell--started) > footer {
          display: none !important;
        }

        .blacktomato-shell:not(.blacktomato-shell--started) .section--hero-banner {
          cursor: pointer;
        }

        .blacktomato-shell .section--hero-banner .container--absolute h1 {
          font-size: clamp(30px, 3.2vw, 56px) !important;
          letter-spacing: 0 !important;
          line-height: 1.08 !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 980px !important;
        }

        .blacktomato-shell .section--testimonials {
          display: none !important;
        }

        .blacktomato-shell .newsletter-popup {
          display: none !important;
        }

        @media screen and (max-width: 640px) {
          .blacktomato-shell .section--hero-banner .container--absolute h1 {
            font-size: 30px !important;
            max-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>

      <div
        className={`${BLACK_TOMATO_BODY_CLASS} blacktomato-shell ${styles.brand} ${themes.theme}`}
      >
        <BlackTomatoHomeMarkup />
      </div>
    </PublicI18nProvider>
  );
}
