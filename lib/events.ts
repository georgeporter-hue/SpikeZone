import type { EventDef, Sex } from './types'

export const EVENTS: EventDef[] = [
  { id: '100m', name: '100m', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '200m', name: '200m', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '400m', name: '400m', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '800m', name: '800m', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '1500m', name: '1500m', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '100mH', name: '100m Hurdles', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '110mH', name: '110m Hurdles', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: '400mH', name: '400m Hurdles', kind: 'track', unit: 's', lowerIsBetter: true },
  { id: 'LJ', name: 'Long Jump', kind: 'field', unit: 'm', lowerIsBetter: false },
  { id: 'HJ', name: 'High Jump', kind: 'field', unit: 'm', lowerIsBetter: false },
  { id: 'TJ', name: 'Triple Jump', kind: 'field', unit: 'm', lowerIsBetter: false },
  { id: 'SP', name: 'Shot Put', kind: 'field', unit: 'm', lowerIsBetter: false },
  { id: 'JT', name: 'Javelin', kind: 'field', unit: 'm', lowerIsBetter: false },
]

export function getEvent(eventId: string): EventDef | undefined {
  return EVENTS.find((e) => e.id === eventId)
}

/**
 * Simplified World Athletics-style scoring coefficients.
 * Track:  points = a * (b - t)^c   (t in seconds, b is the zero-point time)
 * Field:  points = a * (d - b)^c   (d in metres, b is the zero-point distance)
 * Coefficients are tuned to produce plausible, realistic point values, not to
 * exactly reproduce the official tables (this is a prototype).
 */
type Coef = { a: number; b: number; c: number }

const COEFFICIENTS: Record<string, Record<Sex, Coef>> = {
  '100m': { F: { a: 39.3, b: 16.5, c: 2 }, M: { a: 42, b: 15.4, c: 2 } },
  '200m': { F: { a: 9.8, b: 33.5, c: 2 }, M: { a: 10.6, b: 31, c: 2 } },
  '400m': { F: { a: 3.05, b: 70, c: 2 }, M: { a: 3.31, b: 64, c: 2 } },
  '800m': { F: { a: 0.62, b: 165, c: 2 }, M: { a: 0.66, b: 150, c: 2 } },
  '1500m': { F: { a: 0.145, b: 340, c: 2 }, M: { a: 0.16, b: 305, c: 2 } },
  '100mH': { F: { a: 30, b: 19, c: 2 }, M: { a: 30, b: 19, c: 2 } },
  '110mH': { F: { a: 25, b: 20, c: 2 }, M: { a: 27, b: 19.5, c: 2 } },
  '400mH': { F: { a: 2.6, b: 76, c: 2 }, M: { a: 2.85, b: 69, c: 2 } },
  LJ: { F: { a: 190, b: 3.4, c: 1.6 }, M: { a: 175, b: 3.9, c: 1.6 } },
  HJ: { F: { a: 560, b: 1.1, c: 1.5 }, M: { a: 520, b: 1.3, c: 1.5 } },
  TJ: { F: { a: 95, b: 7.5, c: 1.6 }, M: { a: 90, b: 8.5, c: 1.6 } },
  SP: { F: { a: 40, b: 4.5, c: 1.45 }, M: { a: 34, b: 5, c: 1.45 } },
  JT: { F: { a: 12.5, b: 12, c: 1.4 }, M: { a: 10.5, b: 14, c: 1.4 } },
}

export function computeWaPoints(eventId: string, sex: Sex, markValue: number): number {
  const event = getEvent(eventId)
  const coef = COEFFICIENTS[eventId]?.[sex]
  if (!event || !coef) return 0

  let base: number
  if (event.lowerIsBetter) {
    base = coef.b - markValue
  } else {
    base = markValue - coef.b
  }
  if (base <= 0) return 0
  const points = Math.round(coef.a * Math.pow(base, coef.c))
  return Math.max(0, Math.min(1400, points))
}

/**
 * Parse a user-entered mark string into a comparable numeric value.
 * Track times may be entered as "11.45" or "1:46.30" (min:sec).
 * Field marks are plain metres, e.g. "6.42".
 * Returns null when the format is not valid.
 */
export function parseMark(eventId: string, raw: string): { value: number; label: string } | null {
  const event = getEvent(eventId)
  if (!event) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (event.kind === 'field') {
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(trimmed)) return null
    const value = Number.parseFloat(trimmed)
    if (Number.isNaN(value) || value <= 0) return null
    return { value, label: value.toFixed(2) }
  }

  // Track: either seconds "ss.xx" or "m:ss.xx"
  if (/^\d{1,2}\.\d{1,2}$/.test(trimmed)) {
    const value = Number.parseFloat(trimmed)
    if (Number.isNaN(value) || value <= 0) return null
    return { value, label: value.toFixed(2) }
  }
  const m = trimmed.match(/^(\d{1,2}):(\d{2})(\.\d{1,2})?$/)
  if (m) {
    const minutes = Number.parseInt(m[1], 10)
    const seconds = Number.parseInt(m[2], 10)
    const frac = m[3] ? Number.parseFloat(m[3]) : 0
    if (seconds >= 60) return null
    const value = minutes * 60 + seconds + frac
    return { value, label: trimmed }
  }
  return null
}

/** Format a numeric mark value back into a display label for a given event. */
export function formatMark(eventId: string, value: number): string {
  const event = getEvent(eventId)
  if (!event) return value.toFixed(2)
  if (event.kind === 'field') return `${value.toFixed(2)} m`
  if (value >= 60) {
    const minutes = Math.floor(value / 60)
    const seconds = value - minutes * 60
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`
  }
  return `${value.toFixed(2)}s`
}
