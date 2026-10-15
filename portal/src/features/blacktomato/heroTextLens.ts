export const TEXT_GLASS_PADDING = 12;

// Measure the browser's wrapped glyphs so the lens follows the actual text, including mobile lines.
export function createHeroTextLens(element: HTMLElement) {
  const node = element.firstChild;
  if (!(node instanceof Text)) return null;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  if (!width || !height) return null;

  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const context = mask.getContext("2d");
  if (!context) return null;
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  // This is an alpha mask, independent of the text's translucent visual treatment.
  context.fillStyle = "white";
  context.textBaseline = "alphabetic";
  const metrics = context.measureText("Mg");
  const ascent = metrics.fontBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent;
  const range = document.createRange();
  const text = node.textContent ?? "";

  for (let index = 0; index < text.length; index++) {
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    const glyph = range.getBoundingClientRect();
    const character = style.textTransform === "uppercase" ? text[index].toUpperCase() : text[index];
    context.fillText(
      character,
      glyph.left - rect.left,
      glyph.top - rect.top + (glyph.height - ascent - descent) / 2 + ascent,
    );
  }

  const map = document.createElement("canvas");
  map.width = width + TEXT_GLASS_PADDING * 2;
  map.height = height + TEXT_GLASS_PADDING * 2;
  const mapContext = map.getContext("2d");
  if (!mapContext) return null;
  const alpha = context.getImageData(0, 0, width, height).data;
  const edge = document.createElement("canvas");
  edge.width = width;
  edge.height = height;
  const edgeContext = edge.getContext("2d");
  if (!edgeContext) return null;
  const edgePixels = edgeContext.createImageData(width, height);
  const pixels = mapContext.createImageData(map.width, map.height);
  const sample = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height ? alpha[(y * width + x) * 4 + 3] : 0;
  const radius = Math.max(1, Math.round(Number.parseFloat(style.fontSize) / 18));
  const borderRadius = Number.parseFloat(style.fontSize) >= 32 ? 2 : 1;

  // This inner outline is the glyph equivalent of the button's one-pixel border.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const center = sample(x, y);
      let eroded = center;
      for (let oy = -borderRadius; oy <= borderRadius; oy++) {
        for (let ox = -borderRadius; ox <= borderRadius; ox++) {
          eroded = Math.min(eroded, sample(x + ox, y + oy));
        }
      }
      const index = (y * width + x) * 4;
      edgePixels.data[index] = 255;
      edgePixels.data[index + 1] = 255;
      edgePixels.data[index + 2] = 255;
      edgePixels.data[index + 3] = Math.max(0, center - eroded);
    }
  }
  edgeContext.putImageData(edgePixels, 0, 0);

  // The alpha gradient gives each letter its own refracting bevel, including counters and accents.
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const mx = x - TEXT_GLASS_PADDING;
      const my = y - TEXT_GLASS_PADDING;
      const dx = sample(mx + radius, my) - sample(mx - radius, my);
      const dy = sample(mx, my + radius) - sample(mx, my - radius);
      const index = (y * map.width + x) * 4;
      pixels.data[index] = Math.round(127.5 + dx * 0.45);
      pixels.data[index + 1] = Math.round(127.5 + dy * 0.45);
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }
  mapContext.putImageData(pixels, 0, 0);
  return { width, height, mask: mask.toDataURL(), edge: edge.toDataURL(), map: map.toDataURL() };
}
