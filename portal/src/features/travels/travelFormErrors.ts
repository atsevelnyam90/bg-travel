export type TravelEditorTab = "general" | "departures" | "sections" | "details";
export type TravelLocaleTab = "mn" | "en" | "zh" | "ko";

export type TravelFormErrorFeedback = {
  tab: TravelEditorTab;
  locale?: TravelLocaleTab;
  message: string;
};

const errorMetadataKeys = new Set(["message", "type", "types", "ref"]);

const generalFieldLabels: Record<string, string> = {
  name: "Аяллын нэр",
  slug: "Тогтмол холбоос",
  destinationLabel: "Чиглэлийн жижиг гарчиг",
  tagline: "Hero дэд гарчиг",
  description: "Аяллын ерөнхий танилцуулга",
  nameEn: "Travel name",
  destinationLabelEn: "Destination label",
  taglineEn: "Hero subtitle",
  descriptionEn: "Travel overview",
  nameZh: "旅行名称",
  destinationLabelZh: "目的地短标题",
  taglineZh: "主视觉副标题",
  descriptionZh: "旅行介绍",
  nameKo: "여행명",
  destinationLabelKo: "목적지 소제목",
  taglineKo: "히어로 부제목",
  descriptionKo: "여행 소개",
  category: "Ангилал",
  status: "Нийтлэх төлөв",
  coverImage: "Нүүр зураг",
  durationDays: "Хоног",
  version: "Аяллын хувилбар",
};

const departureFieldLabels: Record<string, string> = {
  departureDate: "Гарах огноо",
  returnDate: "Буцах огноо",
  transportType: "Тээврийн төрөл",
  unitPriceMinor: "Нэг хүний үнэ",
  capacity: "Нийт суудал",
  isBookingOpen: "Захиалга авах төлөв",
  version: "Гаралтын хувилбар",
  root: "Гаралтын мэдээлэл",
};

const sectionFieldLabels: Record<string, string> = {
  title: "Бүлгийн гарчиг",
  description: "Бүлгийн танилцуулга",
  titleEn: "Section title",
  descriptionEn: "Section description",
  titleZh: "章节标题",
  descriptionZh: "章节介绍",
  titleKo: "섹션 제목",
  descriptionKo: "섹션 소개",
  mapImage: "Маршрутын зураг",
  images: "Бүлгийн зургууд",
  sortOrder: "Дараалал",
  version: "Бүлгийн хувилбар",
  root: "Бүлгийн мэдээлэл",
};

const detailFieldLabels: Record<string, string> = {
  sectionId: "Хөтөлбөрийн бүлэг",
  dayNumber: "Өдөр",
  title: "Өдрийн гарчиг",
  content: "Өдрийн тайлбар",
  titleEn: "Day title",
  contentEn: "Day description",
  titleZh: "日程标题",
  contentZh: "日程介绍",
  titleKo: "일정 제목",
  contentKo: "일정 설명",
  images: "Өдрийн зургууд",
  version: "Өдрийн хөтөлбөрийн хувилбар",
  root: "Өдрийн хөтөлбөрийн мэдээлэл",
};

const localeByGeneralField: Partial<Record<string, TravelLocaleTab>> = {
  name: "mn",
  destinationLabel: "mn",
  tagline: "mn",
  description: "mn",
  nameEn: "en",
  destinationLabelEn: "en",
  taglineEn: "en",
  descriptionEn: "en",
  nameZh: "zh",
  destinationLabelZh: "zh",
  taglineZh: "zh",
  descriptionZh: "zh",
  nameKo: "ko",
  destinationLabelKo: "ko",
  taglineKo: "ko",
  descriptionKo: "ko",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findFirstErrorPath(value: unknown, path: string[] = []): string[] | null {
  if (!isRecord(value)) return null;
  if (typeof value.message === "string") return path;

  for (const [key, child] of Object.entries(value)) {
    if (errorMetadataKeys.has(key)) continue;
    const childPath = findFirstErrorPath(child, [...path, key]);
    if (childPath) return childPath;
  }

  return null;
}

function getRowNumber(value: string | undefined) {
  if (!value) return null;
  const index = Number.parseInt(value, 10);
  return Number.isNaN(index) ? null : index + 1;
}

function getRelatedFieldLabel(
  path: string[],
  collectionLabel: string,
  rowLabel: string,
  labels: Record<string, string>,
) {
  const rowNumber = getRowNumber(path[1]);
  if (rowNumber === null) return collectionLabel;
  const fieldLabel = labels[path[2] ?? "root"] ?? "Мэдээлэл";
  return `${rowLabel} ${rowNumber} — ${fieldLabel}`;
}

function getErrorTarget(path: string[]): {
  tab: TravelEditorTab;
  locale?: TravelLocaleTab;
  label: string;
} {
  const root = path[0];

  if (root === "departures") {
    return {
      tab: "departures",
      label: getRelatedFieldLabel(path, "Аяллын гаралтууд", "Гаралт", departureFieldLabels),
    };
  }

  if (root === "sections") {
    return {
      tab: "sections",
      label: getRelatedFieldLabel(path, "Хөтөлбөрийн бүлгүүд", "Бүлэг", sectionFieldLabels),
    };
  }

  if (root === "details") {
    return {
      tab: "details",
      label: getRelatedFieldLabel(path, "Өдрийн хөтөлбөр", "Өдөр", detailFieldLabels),
    };
  }

  return {
    tab: "general",
    locale: root ? localeByGeneralField[root] : undefined,
    label: (root && generalFieldLabels[root]) || "Аяллын мэдээлэл",
  };
}

export function getTravelFormErrorFeedback(errors: unknown): TravelFormErrorFeedback {
  const path = findFirstErrorPath(errors) ?? [];
  const target = getErrorTarget(path);

  return {
    tab: target.tab,
    locale: target.locale,
    message: `“${target.label}” талбарыг зөв бөглөнө үү.`,
  };
}
