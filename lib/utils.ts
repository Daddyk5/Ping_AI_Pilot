import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and resolves Tailwind conflicts (later wins), e.g. cn("inline-flex", "hidden") → "hidden". */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
