import type { Category, Sex } from "./types";

export type ImplementId = "SP" | "DT" | "JT" | "HT";

export function getImplementWeight(
  category: Category,
  sex: Sex,
  implement: ImplementId,
): number | null {
  if (category === "Master") return null;

  const weights: Record<Sex, Record<Category, Record<ImplementId, number>>> = {
    M: {
      U12: { SP: 2, DT: 0.6, JT: 0.4, HT: 2 },
      U14: { SP: 3, DT: 0.8, JT: 0.5, HT: 3 },
      U16: { SP: 4, DT: 0.8, JT: 0.5, HT: 4 },
      U18: { SP: 5, DT: 1.5, JT: 0.7, HT: 5 },
      U20: { SP: 6, DT: 1.75, JT: 0.8, HT: 6 },
      U23: { SP: 7.26, DT: 2, JT: 0.8, HT: 7.26 },
      Senior: { SP: 7.26, DT: 2, JT: 0.8, HT: 7.26 },
      Master: { SP: 0, DT: 0, JT: 0, HT: 0 },
    },
    F: {
      U12: { SP: 2, DT: 0.6, JT: 0.4, HT: 2 },
      U14: { SP: 3, DT: 0.8, JT: 0.5, HT: 3 },
      U16: { SP: 3, DT: 0.8, JT: 0.5, HT: 3 },
      U18: { SP: 3, DT: 1, JT: 0.5, HT: 3 },
      U20: { SP: 4, DT: 1, JT: 0.6, HT: 4 },
      U23: { SP: 4, DT: 1, JT: 0.6, HT: 4 },
      Senior: { SP: 4, DT: 1, JT: 0.6, HT: 4 },
      Master: { SP: 0, DT: 0, JT: 0, HT: 0 },
    },
  };

  return weights[sex][category][implement] ?? null;
}
