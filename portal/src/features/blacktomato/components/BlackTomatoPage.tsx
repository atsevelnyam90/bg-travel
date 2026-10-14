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

      <div className={BLACK_TOMATO_BODY_CLASS}>
        <BlackTomatoHomeMarkup />
      </div>
    </>
  );
}
