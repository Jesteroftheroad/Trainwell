import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalMinutes: number | null): string {
  if (!totalMinutes) return "";
  return `${totalMinutes} min`;
}

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatWeight(weight: number | null, unit: string | null): string {
  if (weight === null || weight === undefined) return "";
  const trimmed = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
  return `${trimmed} ${unit ?? "lb"}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseTagList(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
