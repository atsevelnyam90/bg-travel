import { describe, expect, it } from "vitest";
import { travels } from "@/api/generated/contracts";
import {
  hydrateLostGenerationSnapshot,
  prepareLostGenerationSnapshot,
} from "./lostGenerationSnapshotAdapter";

function createTravel(description: string | null): travels.PublicTravel {
  return travels.publicTravelSchema.parse({
    publicId: "6cc7df59-93bf-4499-a9d5-4c90834618eb",
    slug: "formatted-trip",
    name: "Formatted trip",
    destinationLabel: "MONGOLIA",
    tagline: null,
    description,
    category: "DOMESTIC",
    coverImage: null,
    durationDays: 1,
    details: [],
    itinerarySections: [],
    slots: [],
  });
}

function createSnapshotDocument(): Document {
  return document.implementation.createHTMLDocument("Snapshot");
}

function addOverview(snapshot: Document): HTMLElement {
  snapshot.body.innerHTML = `
    <main>
      <section class="section--content">
        <div class="align-text-center content__read-more">
          <h6>Old destination</h6>
          <h3>Old title</h3>
          <p>Old description</p>
        </div>
      </section>
    </main>
  `;
  const overview = snapshot.querySelector<HTMLElement>(".content__read-more");
  if (!overview) throw new Error("Overview fixture is missing");
  return overview;
}

describe("hydrateLostGenerationSnapshot", () => {
  it("removes borrowed text and images before travel data is available", () => {
    const snapshot = createSnapshotDocument();
    snapshot.body.innerHTML = `
      <main>
        <section class="section--hero-banner">
          <div class="banner__image" style="background-image: url(lost-generation.jpg)"></div>
          <div class="container--absolute">
            <div class="h7">France</div>
            <h1>The Lost Generation</h1>
          </div>
        </section>
        <section class="section--subnav"><ul><li>Paris</li></ul></section>
        <section class="section--breadcrumb">
          <ul class="nav--breadcrumbs"><li>The Lost Generation</li></ul>
        </section>
        <section class="section--content">
          <div class="content__read-more">
            <h6>France</h6>
            <h3>The Lost Generation</h3>
            <p>Borrowed description</p>
          </div>
        </section>
      </main>
    `;

    prepareLostGenerationSnapshot(snapshot);

    expect(
      snapshot.body.classList.contains("post-template-template-experience-superitinerary"),
    ).toBe(true);
    expect(snapshot.querySelector<HTMLElement>(".banner__image")?.style.backgroundImage).toBe(
      "none",
    );
    expect(snapshot.querySelector(".section--hero-banner")?.textContent?.trim()).toBe("");
    expect(snapshot.querySelector(".section--subnav ul")?.textContent).toBe("");
    expect(snapshot.querySelector(".nav--breadcrumbs")?.textContent).toBe("");
    expect(snapshot.querySelector(".content__read-more")?.textContent?.trim()).toBe("");
  });

  it("restores the fixed desktop hero background when travel data is hydrated", () => {
    const snapshot = createSnapshotDocument();
    snapshot.body.innerHTML = `
      <main>
        <section class="section--hero-banner">
          <div class="banner__image"></div>
          <div class="container--absolute"><h1></h1></div>
        </section>
      </main>
    `;
    const travel = {
      ...createTravel(null),
      coverImage: "/images/formatted-trip.jpg",
    };

    hydrateLostGenerationSnapshot(snapshot, travel);

    const heroImage = snapshot.querySelector<HTMLElement>(".banner__image");
    expect(heroImage?.style.backgroundAttachment).toBe("fixed");
    expect(heroImage?.style.backgroundImage).toContain("/images/formatted-trip.jpg");
  });

  it("uses the branded placeholder when the travel has no image", () => {
    const snapshot = createSnapshotDocument();
    snapshot.body.innerHTML = `
      <main>
        <section class="section--hero-banner">
          <div class="banner__image"></div>
          <div class="container--absolute"><h1></h1></div>
        </section>
      </main>
    `;

    hydrateLostGenerationSnapshot(snapshot, createTravel(null));

    const heroImage = snapshot.querySelector<HTMLElement>(".banner__image");
    expect(heroImage?.style.backgroundImage).toContain("bg-swirl-dark.jpg");
    expect(heroImage?.hasAttribute("data-travel-image-placeholder")).toBe(true);
  });

  it("preserves rich-text headings, marks, and lists inside the overview", () => {
    const snapshot = createSnapshotDocument();
    const overview = addOverview(snapshot);
    const description = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Included services" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", marks: [{ type: "bold" }], text: "Bold" },
            { type: "text", marks: [{ type: "italic" }], text: " italic" },
            { type: "text", marks: [{ type: "strike" }], text: " strike" },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Hotel" }] }],
            },
          ],
        },
      ],
    });

    hydrateLostGenerationSnapshot(snapshot, createTravel(description));

    const rendered = overview.querySelector<HTMLElement>("[data-travel-description]");
    expect(rendered?.querySelector("h2")?.textContent).toBe("Included services");
    expect(rendered?.querySelector("strong")?.textContent).toBe("Bold");
    expect(rendered?.querySelector("em")?.textContent).toBe(" italic");
    expect(rendered?.querySelector("s")?.textContent).toBe(" strike");
    expect(rendered?.querySelector("ul > li")?.textContent).toBe("Hotel");
    expect(overview.textContent).not.toContain("Old description");
  });

  it("replaces the borrowed breadcrumb and applies compact left-aligned editorial styles", () => {
    const snapshot = createSnapshotDocument();
    addOverview(snapshot);
    const breadcrumb = snapshot.createElement("section");
    breadcrumb.className = "section--breadcrumb";
    breadcrumb.innerHTML = `
      <ul class="nav--breadcrumbs">
        <li>Home / Destinations / Europe / France / The Lost Generation</li>
      </ul>
    `;
    snapshot.querySelector("main")?.prepend(breadcrumb);

    hydrateLostGenerationSnapshot(snapshot, createTravel("Trip description"));

    const renderedBreadcrumb = snapshot.querySelector(".nav--breadcrumbs");
    expect(renderedBreadcrumb?.textContent).toBe("BG Travel / Аяллууд / Formatted trip");
    expect(renderedBreadcrumb?.querySelectorAll("a")).toHaveLength(2);
    expect(renderedBreadcrumb?.textContent).not.toContain("The Lost Generation");
    expect(snapshot.getElementById("bg-travel-snapshot-overrides")?.textContent).toContain(
      "text-align: left !important",
    );
    expect(snapshot.getElementById("bg-travel-snapshot-overrides")?.textContent).toContain(
      "margin-bottom: 0 !important",
    );
  });

  it("replaces the rendered description instead of duplicating it on rehydration", () => {
    const snapshot = createSnapshotDocument();
    const overview = addOverview(snapshot);
    const first = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "First version" }],
        },
      ],
    });
    const second = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Second version" }] }],
    });

    hydrateLostGenerationSnapshot(snapshot, createTravel(first));
    hydrateLostGenerationSnapshot(snapshot, createTravel(second));

    expect(overview.querySelectorAll("[data-travel-description]")).toHaveLength(1);
    expect(overview.querySelector("[data-travel-description]")?.textContent).toBe("Second version");
    expect(overview.textContent).not.toContain("First version");
  });

  it("lets the original sticky layout control a grouped route map height", () => {
    const snapshot = createSnapshotDocument();
    snapshot.body.innerHTML = `
      <main>
        <section class="section section--destination bg-light">
          <div class="section--destination__map"></div>
          <div class="section--destination__wrapper"><div></div></div>
        </section>
        <section class="section--destination-carousel">
          <div data-slickslider="destination"></div>
        </section>
      </main>
    `;
    const travel = {
      ...createTravel(null),
      itinerarySections: [
        {
          title: "Хангай",
          description: null,
          mapImage: "/maps/khangai.webp",
          images: [],
          details: [],
        },
      ],
    } satisfies travels.PublicTravel;

    hydrateLostGenerationSnapshot(snapshot, travel);

    const mapHolder = snapshot.querySelector<HTMLElement>(".section--destination__map > div");
    expect(mapHolder?.style.height).toBe("");
    expect(mapHolder?.style.minHeight).toBe("500px");
    expect(mapHolder?.style.backgroundRepeat).toBe("no-repeat");
    expect(mapHolder?.style.backgroundSize).toBe("cover");
  });
});
