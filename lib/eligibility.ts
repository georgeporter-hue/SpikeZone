import type { Category, Sex } from "./types";

export type Modality = "outdoor" | "short-track";

const COMMON_FIELD = ["LJ", "HJ", "TJ", "PV", "SP", "DT", "JT", "HT"];

const OUTDOOR: Record<Category, string[]> = {
  U12: ["60m", "500m", "1000m", "2000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP", "2000mRW", ...COMMON_FIELD],
  U14: ["80m", "150m", "500m", "1000m", "3000m", "80mH", "220mH", "1000mSC", "2000mRW", ...COMMON_FIELD],
  U16: ["100m", "300m", "600m", "1000m", "3000m", "100mH", "300mH", "1500mSC", "3000mRW", ...COMMON_FIELD],
  U18: ["100m", "200m", "400m", "800m", "1500m", "3000m", "5000m", "110mH", "400mH", "2000mSC", "3000mSC", "5000mRW", ...COMMON_FIELD],
  U20: ["100m", "200m", "400m", "800m", "1500m", "3000m", "5000m", "110mH", "400mH", "2000mSC", "3000mSC", "5000mRW", ...COMMON_FIELD],
  U23: ["100m", "200m", "400m", "800m", "1500m", "3000m", "5000m", "10000m", "100mH", "110mH", "400mH", "3000mSC", "10000mRW", ...COMMON_FIELD],
  Senior: ["100m", "200m", "400m", "800m", "1500m", "3000m", "5000m", "10000m", "110mH", "400mH", "3000mSC", "10000mRW", ...COMMON_FIELD],
  Master: ["100m", "200m", "400m", "800m", "1500m", "3000m", "5000m", "10000m", "110mH", "400mH", "3000mSC", ...COMMON_FIELD],
};

const SHORT_TRACK: Record<Category, string[]> = {
  U12: ["60m", "500m", "1000m", "60mH", "600m", "LJ", "HJ", "TJ", "PV", "SP"],
  U14: ["60m", "80m", "500m", "1000m", "2000m", "60mH", "80mH", "LJ", "HJ", "TJ", "PV", "SP"],
  U16: ["60m", "300m", "600m", "1000m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
  U18: ["60m", "200m", "400m", "800m", "1500m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
  U20: ["60m", "200m", "400m", "800m", "1500m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
  U23: ["60m", "200m", "400m", "800m", "1500m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
  Senior: ["60m", "200m", "400m", "800m", "1500m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
  Master: ["60m", "200m", "400m", "800m", "1500m", "3000m", "60mH", "LJ", "HJ", "TJ", "PV", "SP"],
};

export function isEventAllowed(
  category: Category,
  sex: Sex,
  modality: Modality,
  eventId: string,
): boolean {
  const events = modality === "outdoor" ? OUTDOOR[category] : SHORT_TRACK[category];

  if (!events?.includes(eventId)) return false;

  if (eventId === "100mH" && sex !== "F") return false;
  if (eventId === "110mH" && sex !== "M") return false;

  return true;
}

export function getAllowedEvents(
  category: Category,
  sex: Sex,
  modality: Modality,
  eventIds: string[],
): string[] {
  return eventIds.filter((eventId) =>
    isEventAllowed(category, sex, modality, eventId),
  );
}
