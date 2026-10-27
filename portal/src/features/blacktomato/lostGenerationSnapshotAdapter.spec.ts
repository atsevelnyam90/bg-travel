import { describe, expect, it } from "vitest";
import { travels } from "@/api/generated/contracts";
import { hydrateLostGenerationSnapshot } from "./lostGenerationSnapshotAdapter";

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
  it("preserves rich-text headings, marks, and lists inside the centered overview", () => {
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
    expect(overview.classList.contains("align-text-center")).toBe(true);
    expect(rendered?.querySelector("h2")?.textContent).toBe("Included services");
    expect(rendered?.querySelector("strong")?.textContent).toBe("Bold");
    expect(rendered?.querySelector("em")?.textContent).toBe(" italic");
    expect(rendered?.querySelector("s")?.textContent).toBe(" strike");
    expect(rendered?.querySelector("ul > li")?.textContent).toBe("Hotel");
    expect(overview.textContent).not.toContain("Old description");
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
});
