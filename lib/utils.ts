import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEnvString(value: string | undefined, fallback = "") {
  return (value ?? fallback).trim();
}
