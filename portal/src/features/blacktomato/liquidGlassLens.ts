// Rounded-rectangle displacement technique from https://github.com/cocolayuan/liquid-glass.
// Keep the map local to the button; the video itself is never copied or decoded twice.
export const GLASS_PADDING = 20;

export function createLiquidGlassLens(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width + GLASS_PADDING * 2;
  canvas.height = height + GLASS_PADDING * 2;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const pixels = context.createImageData(canvas.width, canvas.height);
  const radius = height / 2;
  const distance = (x: number, y: number) => {
    const dx = Math.abs(x - canvas.width / 2) - (width / 2 - radius);
    const dy = Math.abs(y - canvas.height / 2);
    return Math.hypot(Math.max(dx, 0), dy) + Math.min(Math.max(dx, dy), 0) - radius;
  };

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      const edge = distance(cx, cy);
      const dx = distance(cx + 1, cy) - distance(cx - 1, cy);
      const dy = distance(cx, cy + 1) - distance(cx, cy - 1);
      const length = Math.hypot(dx, dy) || 1;
      const amount = Math.max(0, 1 - Math.abs(edge) / (edge < 0 ? 12 : 4));
      const smooth = amount ** 3 * (amount * (amount * 6 - 15) + 10);
      const strength = smooth ** 2.2 * 100;
      const index = (y * canvas.width + x) * 4;
      pixels.data[index] = Math.round(127.5 - (dx / length) * strength);
      pixels.data[index + 1] = Math.round(127.5 - (dy / length) * strength);
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL();
}
