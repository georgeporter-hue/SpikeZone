import type { Category } from "./types";

export function getCategory(birthDate: string, seasonYear = new Date().getFullYear()): Category {
  const birthYear = new Date(birthDate).getFullYear();

  if (birthYear >= seasonYear - 11 && birthYear <= seasonYear - 10) return "U12";
  if (birthYear >= seasonYear - 13 && birthYear <= seasonYear - 12) return "U14";
  if (birthYear >= seasonYear - 15 && birthYear <= seasonYear - 14) return "U16";
  if (birthYear >= seasonYear - 17 && birthYear <= seasonYear - 16) return "U18";
  if (birthYear >= seasonYear - 19 && birthYear <= seasonYear - 18) return "U20";
  if (birthYear >= seasonYear - 22 && birthYear <= seasonYear - 20) return "U23";
  if (birthYear <= seasonYear - 23) return "Senior";

  throw new Error("Esta edad pertenece a una categoría que SpikeZone todavía no admite.");
}
