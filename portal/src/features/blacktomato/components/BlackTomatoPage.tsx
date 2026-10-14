import { BlackTomatoBodyClass } from "./BlackTomatoBodyClass";
import { BlackTomatoHomeMarkup } from "./BlackTomatoHomeMarkup";
import { BlackTomatoInteractions } from "./BlackTomatoInteractions";
import {
  BLACK_TOMATO_BODY_CLASS,
  BLACK_TOMATO_CSS,
  BLACK_TOMATO_FONTS,
} from "./blackTomatoConstants";

export function BlackTomatoPage() {
  return (
    <>
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

        .blacktomato-shell .section--testimonials {
          display: none !important;
        }
      `}</style>

      <div className={`${BLACK_TOMATO_BODY_CLASS} blacktomato-shell`}>
        <BlackTomatoHomeMarkup />
      </div>
    </>
  );
}
