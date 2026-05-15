import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEnvString(value: string | undefined, fallback = "") {
  return (value ?? fallback).trim();
}

const MAX_QUERY_LENGTH = 500;
const MAX_QUESTION_LENGTH = 600;
const INJECTION_PATTERN = /(?:system|prompt|instructions|ignore previous|ignore above|disregard|forget|you are now|you are a)/gi;

export function sanitizePromptInput(input: string, maxLength = MAX_QUERY_LENGTH): string {
  if (!input) return "";

  const normalized = input
    .normalize("NFKC")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim();

  const truncated = normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;

  return truncated;
}

export function sanitizeQuery(query: string): string {
  return sanitizePromptInput(query, MAX_QUERY_LENGTH);
}

export function sanitizeQuestion(question: string): string {
  return sanitizePromptInput(question, MAX_QUESTION_LENGTH);
}

export function checkInjectionRisk(input: string): boolean {
  const normalized = input.normalize("NFKC");
  return INJECTION_PATTERN.test(normalized);
}

export function maskSensitiveData(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars * 2) {
    return "*".repeat(value.length);
  }
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const masked = "*".repeat(Math.min(value.length - visibleChars * 2, 12));
  return `${start}${masked}${end}`;
}
