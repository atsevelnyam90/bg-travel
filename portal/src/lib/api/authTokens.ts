import { platform } from "@/platform";

// Web нь httpOnly cookie ашиглана — токен JS-д хадгалагдахгүй нь илүү аюулгүй.
// Mobile (Capacitor) нь cookie найдвартай ажилладаггүй тул Bearer токен
// platform.storage-д хадгална (native дээр Preferences, web дээр localStorage).
//
// Тиймээс энд токен БАЙХГҮЙ байх нь хэвийн — web дээр үргэлж хоосон байна.

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

let cachedAccess: string | null = null;

export async function loadTokens(): Promise<void> {
  if (platform.name === "web") {
    cachedAccess = null;
    return;
  }

  cachedAccess = await platform.storage.get(ACCESS_KEY);
}

export function getAccessToken(): string | null {
  return platform.name === "web" ? null : cachedAccess;
}

export async function getRefreshToken(): Promise<string | null> {
  if (platform.name === "web") return null;
  return platform.storage.get(REFRESH_KEY);
}

export async function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  if (platform.name === "web") {
    cachedAccess = null;
    await Promise.all([platform.storage.remove(ACCESS_KEY), platform.storage.remove(REFRESH_KEY)]);
    return;
  }

  cachedAccess = tokens.accessToken;
  await platform.storage.set(ACCESS_KEY, tokens.accessToken);
  await platform.storage.set(REFRESH_KEY, tokens.refreshToken);
}

export async function clearTokens(): Promise<void> {
  cachedAccess = null;
  await platform.storage.remove(ACCESS_KEY);
  await platform.storage.remove(REFRESH_KEY);
}
