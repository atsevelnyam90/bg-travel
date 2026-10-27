import { describe, expect, it } from "vitest";
import { hydrateSnapshotGallery } from "./lostGenerationSnapshotCarousel";

function createCarousel(): HTMLElement {
  const carousel = document.createElement("section");
  carousel.innerHTML = `
    <div data-slickslider="destination"></div>
    <div class="arrow-hover">
      <div class="arrow-hover__left"></div>
      <div class="arrow-hover__right"></div>
    </div>
    <div class="slider__meta">
      <button class="slick__prev" type="button"></button>
      <div class="slider__count"></div>
      <button class="slick__next" type="button"></button>
    </div>
  `;
  document.body.append(carousel);
  return carousel;
}

describe("hydrateSnapshotGallery", () => {
  it("keeps custom slides visible without the Slick JavaScript runtime", () => {
    const carousel = createCarousel();

    hydrateSnapshotGallery(carousel, ["/one.jpg", "/two.jpg", "/three.jpg"], "Монгол");

    const slides = carousel.querySelectorAll<HTMLElement>(".slick-slide");
    expect(slides).toHaveLength(3);
    slides.forEach((slide) => {
      expect(slide.style.display).toBe("block");
    });
    expect(carousel.querySelector(".slider__count")?.textContent).toBe("1 / 3");
  });
});
