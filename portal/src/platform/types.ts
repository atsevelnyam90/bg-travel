// Platform adapter — web ↔ Capacitor native ялгааг ЭНД нуух.
//
// winu-portal-д Capacitor.isNativePlatform() шалгалт 148 газар тархсан байсан.
// Энэ интерфейсийн ард нуувал app код platform-ыг огт мэдэхгүй болно.
//
// ⚠️ Энэ нь дэлгэцийн ӨРГӨНӨӨС хамааралгүй. Layout сонголтод `useIsMobile()`.

export type ShareInput = {
  title?: string;
  text?: string;
  url?: string;
};

export type PickedFile = {
  name: string;
  mimeType: string;
  /** Урьдчилан харах / upload хийхэд бэлэн blob URL эсвэл data URI. */
  uri: string;
  blob?: Blob;
};

export type PlatformStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

export type PlatformAdapter = {
  readonly name: "web" | "native";
  storage: PlatformStorage;
  share(input: ShareInput): Promise<void>;
  pickImage(): Promise<PickedFile | null>;
  openExternal(url: string): Promise<void>;
};
