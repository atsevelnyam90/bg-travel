import type { PickedFile, PlatformAdapter, ShareInput } from "./types";

const memoryFallback = new Map<string, string>();

// Private-browsing горимд localStorage шидэж болзошгүй тул санах ойн нөөцтэй.
const storage = {
  async get(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },
  async set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryFallback.set(key, value);
    }
  },
  async remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryFallback.delete(key);
    }
  },
};

async function share(input: ShareInput): Promise<void> {
  if (navigator.share) {
    await navigator.share(input);
    return;
  }
  if (input.url) await navigator.clipboard.writeText(input.url);
}

function pickImage(): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      resolve({
        name: file.name,
        mimeType: file.type,
        uri: URL.createObjectURL(file),
        blob: file,
      });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export const webPlatform: PlatformAdapter = {
  name: "web",
  storage,
  share,
  pickImage,
  async openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  },
};
