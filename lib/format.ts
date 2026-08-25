export function timeAgo(date: Date | string | number): string {
  const d = typeof date === "object" ? date : new Date(date);
  const seconds = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  const intervals: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n}${label} ago`;
  }
  return `${seconds}s ago`;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
