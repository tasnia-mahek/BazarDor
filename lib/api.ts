
const API_BASE_URLS = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

export type Market = {
  market: string;
  division: string;
  min: number;
  max: number;
};

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
  change: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
  markets: Market[];
};

export type Category = {
  id: string;
  slug: string;
  nameBn: string;
  icon: string;
};

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  let lastError: unknown;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to load BazarDor data from either API. ${
      lastError instanceof Error ? lastError.message : ""
    }`
  );
}

export async function getProducts(): Promise<Product[]> {
  const data = await fetchFromApi<Product[]>("/products");

  if (!Array.isArray(data)) {
    throw new Error("Invalid products response from API.");
  }

  return data;
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchFromApi<Category[]>("/categories");

  if (!Array.isArray(data)) {
    throw new Error("Invalid categories response from API.");
  }

  return data;
}

export async function getProductsByCategory(
  slug: string
): Promise<Product[]> {
  const products = await getProducts();

  return products.filter((product) => product.category === slug);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("bn-BD").format(price);
}

export function formatUnit(unit: string): string {
  const units: Record<string, string> = {
    kg: "প্রতি কেজি",
    liter: "প্রতি লিটার",
    litre: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
    pcs: "প্রতি পিস",
  };

  return units[unit.toLowerCase()] ?? `প্রতি ${unit}`;
}
