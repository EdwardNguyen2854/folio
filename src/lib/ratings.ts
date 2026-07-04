import type { Rating } from '../types';

export const emptyRating: Rating = {
  overall: 0,
  clarity: 0,
  usefulness: 0,
};

export function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(5, Math.round(value * 2) / 2));
}

export function ratingLabel(value: number): string {
  if (value <= 0) return 'Unrated';
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}
