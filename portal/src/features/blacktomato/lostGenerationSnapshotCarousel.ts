function updateCount(carousel: HTMLElement, list: HTMLElement, slides: HTMLElement[]): void {
  if (slides.length === 0) return;
  const listLeft = list.getBoundingClientRect().left;
  const index = slides.reduce(
    (closest, slide, slideIndex) =>
      Math.abs(slide.getBoundingClientRect().left - listLeft) < closest.distance
        ? { distance: Math.abs(slide.getBoundingClientRect().left - listLeft), index: slideIndex }
        : closest,
    { distance: Number.POSITIVE_INFINITY, index: 0 },
  ).index;
  const count = carousel.querySelector(".slider__count");
  if (count) count.textContent = `${index + 1} / ${slides.length}`;
}

function bindMouseDrag(list: HTMLElement): void {
  let dragging = false;
  let startScrollLeft = 0;
  let startX = 0;

  list.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  list.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startScrollLeft = list.scrollLeft;
    list.style.cursor = "grabbing";
    event.preventDefault();
  });
  list.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    event.preventDefault();
    list.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    list.style.cursor = "grab";
  };
  list.addEventListener("mouseleave", endDrag);
  list.addEventListener("mouseup", endDrag);
}

function bindNavigation(carousel: HTMLElement, list: HTMLElement, slides: HTMLElement[]): void {
  const scroll = (direction: -1 | 1) => {
    const distance = slides[0]?.getBoundingClientRect().width ?? list.clientWidth * 0.8;
    list.scrollBy({ behavior: "smooth", left: direction * (distance + 18) });
  };

  carousel.querySelectorAll<HTMLElement>(".arrow-hover__left, .slick__prev").forEach((control) => {
    control.addEventListener("click", () => scroll(-1));
  });
  carousel.querySelectorAll<HTMLElement>(".arrow-hover__right, .slick__next").forEach((control) => {
    control.addEventListener("click", () => scroll(1));
  });

  list.addEventListener("scroll", () => updateCount(carousel, list, slides), {
    passive: true,
  });
}

export function hydrateSnapshotGallery(
  carousel: HTMLElement | null,
  images: string[],
  title: string,
): void {
  if (!carousel) return;
  carousel.hidden = images.length === 0;
  carousel.style.display = images.length === 0 ? "none" : "";
  if (images.length === 0) return;

  const slider = carousel.querySelector<HTMLElement>('[data-slickslider="destination"]');
  if (!slider) return;
  slider.replaceChildren();
  const hoverOverlay = carousel.querySelector<HTMLElement>(".arrow-hover");
  if (hoverOverlay) hoverOverlay.style.pointerEvents = "none";

  const list = carousel.ownerDocument.createElement("div");
  list.className = "slick-list draggable";
  list.setAttribute("aria-label", `${title} зургийн цомог`);
  list.tabIndex = 0;
  list.style.cursor = "grab";
  list.style.overflowX = "auto";
  list.style.overflowY = "hidden";
  list.style.overscrollBehaviorX = "contain";
  list.style.scrollSnapType = "x mandatory";
  list.style.scrollbarWidth = "none";
  list.style.touchAction = "pan-x pan-y";
  list.style.setProperty("-webkit-overflow-scrolling", "touch");

  const track = carousel.ownerDocument.createElement("div");
  track.className = "slick-track";
  track.style.display = "flex";
  track.style.gap = "18px";
  track.style.transform = "none";
  track.style.width = "max-content";

  const slides = images.map((image, index) => {
    const slide = carousel.ownerDocument.createElement("div");
    slide.className = "slide slick-slide";
    // The borrowed Slick stylesheet hides slides until its JavaScript marks the carousel ready.
    // This gallery is hydrated without Slick, so keep the generated slides visible explicitly.
    slide.style.display = "block";
    slide.style.flex = "0 0 min(42vw, 620px)";
    slide.style.height = "550px";
    slide.style.scrollSnapAlign = "start";
    slide.style.width = "min(42vw, 620px)";
    const imageElement = carousel.ownerDocument.createElement("img");
    imageElement.alt = `${title} · ${index + 1}`;
    imageElement.draggable = false;
    imageElement.loading = "lazy";
    imageElement.src = image;
    imageElement.className = "w-full h-full object-cover";
    slide.append(imageElement);
    track.append(slide);
    return slide;
  });

  list.append(track);
  slider.append(list);
  bindMouseDrag(list);
  bindNavigation(carousel, list, slides);
  updateCount(carousel, list, slides);
}
