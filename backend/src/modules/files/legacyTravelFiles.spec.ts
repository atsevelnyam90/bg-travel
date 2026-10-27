import { describe, expect, it } from "vitest";
import { normalizeLegacyTravelFileUrl } from "./legacyTravelFiles";

const key = "7bcc8f73-6ed0-472d-896b-7431893b6614.png";

describe("normalizeLegacyTravelFileUrl", () => {
  it("хуучин relative болон absolute file URL-ыг шинэ endpoint рүү хөрвүүлнэ", () => {
    expect(normalizeLegacyTravelFileUrl(`files/server/${key}`)).toMatch(
      new RegExp(`/api/v1/legacy-travel-files/${key}$`),
    );
    expect(
      normalizeLegacyTravelFileUrl(`https://www.bgtravel.mn/api/v1/builder/files/server/${key}`),
    ).toMatch(new RegExp(`/api/v1/legacy-travel-files/${key}$`));
  });

  it("гадаад asset URL-ыг өөрчлөхгүй", () => {
    const url = "https://cdn.example.com/travel/photo.png";
    expect(normalizeLegacyTravelFileUrl(url)).toBe(url);
  });
});
