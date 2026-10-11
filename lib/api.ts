const BASE_URL = "https://openapi.programming-hero.com/api/bazardor";

export type Market = { market: string; division: string; min: number; max: number };

export type Product = {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: { dir: "up" | "down" | "flat"; pct: number };
  markets: Market[];
};

export type Category = { id: string; slug: string; nameBn: string; icon: string };

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export const getProducts = () => request<Product[]>("/products");
export const getCategories = () => request<Category[]>("/categories");

const bn = (n: number, opts?: Intl.NumberFormatOptions) => n.toLocaleString("bn-BD", opts);

export const toBn = (n: number) => bn(n);

export function formatPrice(n: number) {
  return Number.isInteger(n)
    ? bn(n)
    : bn(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPct(n: number) {
  return bn(Math.abs(n), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const UNITS: Record<string, string> = {
  kg: "প্রতি কেজি",
  litre: "প্রতি লিটার",
  liter: "প্রতি লিটার",
  l: "প্রতি লিটার",
  dozen: "প্রতি ডজন",
  piece: "প্রতি পিস",
  pcs: "প্রতি পিস",
  pc: "প্রতি পিস",
};

export function formatUnit(unit: string) {
  const key = unit.trim().toLowerCase();
  if (UNITS[key]) return UNITS[key];
  return unit.startsWith("প্রতি") ? unit : `প্রতি ${unit}`;
}

export const unitShort = (unit: string) => formatUnit(unit).replace("প্রতি ", "");