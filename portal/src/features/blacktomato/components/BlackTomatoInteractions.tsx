"use client";

import { useEffect } from "react";

let bookingDrawerTrigger: HTMLElement | null = null;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function closestElement(target: EventTarget | null, selector: string) {
  return target instanceof Element ? target.closest(selector) : null;
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function startPage() {
  document.querySelector(".blacktomato-shell")?.classList.add("blacktomato-shell--started");
}

function getAnchorTarget(trigger: EventTarget | null) {
  if (!(trigger instanceof HTMLAnchorElement) || !trigger.hash) {
    return null;
  }

  return document.getElementById(trigger.hash.slice(1));
}

function preventLocalFormSubmit(root: ParentNode) {
  root.querySelectorAll("form").forEach((form) => {
    if (form instanceof HTMLFormElement && form.dataset.allowSubmit === "true") {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  });
}

function bindDismissButtons(root: ParentNode) {
  root.querySelectorAll(".js-dismiss-regionalisation-banner").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closestElement(event.currentTarget, ".header__regionalisation")?.remove();
    });
  });

  root.querySelectorAll(".newsletter-popup .close").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closestElement(event.currentTarget, ".newsletter-popup")?.remove();
    });
  });
}

function bindJourneyStart(root: ParentNode) {
  root.querySelectorAll(".js-start-journey").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (closestElement(event.currentTarget, ".section--hero-banner")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openBookingDrawer(event.currentTarget instanceof HTMLElement ? event.currentTarget : null);
    });
  });
}

function bindPageScroll(root: ParentNode) {
  root
    .querySelectorAll(
      ".js-explore-trips, .js-scroll-page-down, .section--hero-banner .js-start-journey",
    )
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const trigger = event.currentTarget;

        event.preventDefault();
        event.stopPropagation();

        startPage();

        window.requestAnimationFrame(() => {
          const target = closestElement(trigger, ".section--hero-banner .js-start-journey")
            ? document.getElementById("journey-start")
            : getAnchorTarget(trigger);

          if (target) {
            target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
            return;
          }

          window.scrollBy({ top: window.innerHeight, behavior: getScrollBehavior() });
        });
      });
    });
}

function openBookingDrawer(trigger: HTMLElement | null) {
  bookingDrawerTrigger = trigger;
  startPage();
  document
    .querySelector(".blacktomato-shell")
    ?.classList.add("blacktomato-shell--started", "blacktomato-shell--booking-open");
  document.body.classList.add("blacktomato-booking-open");
  window.requestAnimationFrame(() => {
    document
      .getElementById("booking-drawer")
      ?.querySelector<HTMLElement>("[data-booking-initial-focus]")
      ?.focus({ preventScroll: true });
  });
}

function closeBookingDrawer() {
  const shell = document.querySelector(".blacktomato-shell");
  if (!shell?.classList.contains("blacktomato-shell--booking-open")) return;
  shell.classList.remove("blacktomato-shell--booking-open");
  document.body.classList.remove("blacktomato-booking-open");
  bookingDrawerTrigger?.focus({ preventScroll: true });
  bookingDrawerTrigger = null;
}

function trapBookingDrawerFocus(event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const shell = document.querySelector(".blacktomato-shell");
  const drawer = document.getElementById("booking-drawer");
  if (!shell?.classList.contains("blacktomato-shell--booking-open") || !drawer) return;

  const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.offsetParent !== null && element.tabIndex >= 0,
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bindBookingDrawer(root: ParentNode) {
  root.querySelectorAll(".js-close-booking-drawer").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeBookingDrawer();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBookingDrawer();
      return;
    }
    trapBookingDrawerFocus(event);
  });
}

function bindMobileMenu(root: ParentNode) {
  root.querySelectorAll(".js-menu-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closestElement(event.currentTarget, ".header")?.classList.toggle("menu-open");
      document.body.classList.toggle("menu-open");
    });
  });

  root.querySelectorAll(".header__sidebar .menu-item-has-children > a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const item = closestElement(event.currentTarget, ".menu-item-has-children");
      if (!item) {
        return;
      }

      event.preventDefault();
      item.classList.add("is-active");
    });
  });

  root.querySelectorAll(".header__sidebar .menu-item-back > a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closestElement(event.currentTarget, ".nav__submenu")?.parentElement?.classList.remove(
        "is-active",
      );
    });
  });
}

function bindTabs(root: ParentNode) {
  root.querySelectorAll(".js-toggle-tab").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const trigger = event.currentTarget;
      if (!(trigger instanceof HTMLElement)) {
        return;
      }

      const tabName = trigger.dataset.toggleTab;
      const section = closestElement(trigger, ".section--filtered_tiles");
      if (!tabName || !section) {
        return;
      }

      section.querySelectorAll(".js-toggle-tab").forEach((item) => {
        item.classList.remove("is-active");
      });
      section.querySelectorAll(".section__tab").forEach((item) => {
        item.classList.remove("is-active");
      });
      trigger.classList.add("is-active");
      section.querySelector(`[data-tab="${tabName}"]`)?.classList.add("is-active");
    });
  });
}

function bindAccordions(root: ParentNode) {
  root.querySelectorAll(".accordion__top").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const trigger = event.currentTarget;
      if (!(trigger instanceof HTMLElement)) {
        return;
      }

      const content = trigger.parentElement?.querySelector<HTMLElement>(".accordion__bottom");
      const symbol = trigger.querySelector(".symbol");
      const isOpen = trigger.classList.toggle("is-open");

      if (content) {
        content.style.display = isOpen ? "block" : "none";
      }
      if (symbol) {
        symbol.textContent = isOpen ? "-" : "+";
      }
    });
  });
}

function bindHorizontalScrollers(root: ParentNode) {
  root.querySelectorAll(".scroller").forEach((scroller) => {
    const content = scroller.querySelector<HTMLElement>(".wrap, .grid, .wrapper, .cards");
    const previous = scroller.querySelector<HTMLElement>(".scroller__arrow--prev");
    const next = Array.from(scroller.querySelectorAll<HTMLElement>(".scroller__arrow")).find(
      (arrow) => !arrow.classList.contains("scroller__arrow--prev"),
    );

    if (!content || !next) {
      return;
    }

    previous?.addEventListener("click", () => {
      content.scrollBy({ left: -content.clientWidth * 0.85, behavior: getScrollBehavior() });
    });
    next.addEventListener("click", () => {
      content.scrollBy({ left: content.clientWidth * 0.85, behavior: getScrollBehavior() });
      previous?.classList.remove("disabled");
    });
  });
}

export function BlackTomatoInteractions() {
  useEffect(() => {
    const root = document;

    preventLocalFormSubmit(root);
    bindDismissButtons(root);
    bindJourneyStart(root);
    bindPageScroll(root);
    bindBookingDrawer(root);
    bindMobileMenu(root);
    bindTabs(root);
    bindAccordions(root);
    bindHorizontalScrollers(root);
  }, []);

  return null;
}
