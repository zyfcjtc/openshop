import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

const locales: Record<string, Record<string, unknown>> = { en, zh };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

const locale = process.env.NEXT_PUBLIC_LOCALE || "en";
const messages = locales[locale] || en;

export function t(key: string, params?: Record<string, string | number>): string {
  let value = getNestedValue(messages as Record<string, unknown>, key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}
