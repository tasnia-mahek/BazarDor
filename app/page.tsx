import Link from "next/link";
import Image from "next/image";
import {
  getProducts,
  getCategories,
  formatPrice,
  formatUnit,
  type Product,
} from "@/lib/api";

const CONTAINER = "mx-auto w-full max-w-[1152px] px-4 sm:px-6";

function ProductCard({ product }: { product: Product }) {
  const direction = product.change.dir;
  const changeClass =
    direction === "up"
      ? "bg-[#fff1ef] text-[#dc4037]"
      : direction === "down"
        ? "bg-[#eaf7ed] text-[#168744]"
        : "bg-[#f0f3ef] text-[#667067]";

  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex min-h-[116px] flex-col justify-between rounded-2xl border border-[#e2e9e2] bg-[#fbfdfb] px-4 py-3.5 transition-colors hover:border-[#b8d8bf] hover:bg-white"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ef] text-[22px] leading-none">
          {product.image}
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate text-[16px] font-bold leading-[1.35] text-[#29352c] group-hover:text-[#178342]">
            {product.nameBn}
          </h3>
          <p className="mt-0.5 text-[13px] leading-[1.3] text-[#7a827b]">
            {formatUnit(product.unit)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[12px] leading-[1.2] text-[#7b827c]">আজকের দাম</p>
          <p className="mt-0.5 text-[20px] font-bold leading-[1.2] text-[#202b23]">
            {formatPrice(product.today)} টাকা
          </p>
        </div>
        <span
          className={`mb-0.5 shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none ${changeClass}`}
        >
          {arrow} {Math.abs(product.change.pct)}%
        </span>
      </div>
    </Link>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  id,
  kind = "default",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  id?: string;
  kind?: "up" | "down" | "default";
}) {
  if (!products.length) return null;

  return (
    <section id={id} className="mt-10 scroll-mt-4">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-[20px] font-bold leading-7 text-[#253329]">
          {kind === "up" && <span className="text-[16px] text-[#e54b43]">▲</span>}
          {kind === "down" && <span className="text-[16px] text-[#168744]">▼</span>}
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[14px] leading-5 text-[#7a837b]">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let apiError = false;

  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
  } catch {
    apiError = true;
  }

  const risers = products
    .filter((product) => product.change.dir === "up")
    .sort((a, b) => b.change.pct - a.change.pct)
    .slice(0, 6);

  const fallers = products
    .filter((product) => product.change.dir === "down")
    .sort((a, b) => a.change.pct - b.change.pct)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f0f5f1] text-[#253329]">
      <header className="border-b border-[#e8eee8] bg-[#fbfdfb]">
        <div className={CONTAINER}>
          <div className="flex h-[64px] items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-[10px] bg-[#078b45]">
                <Image
                  src="/logo-icon.png"
                  alt="বাজার দর"
                  width={40}
                  height={40}
                  priority
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="flex flex-col">
                <span className="text-[20px] font-bold leading-[1.15] text-[#1d2b22]">
                  বাজার দর
                </span>
                <span className="mt-[3px] text-[12px] leading-none text-[#69746b]">
                  শুক্রবার, ১০ অক্টোবর, ২০২৬
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-[14px] text-[#303b32]">
              <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#e8ece8] text-[16px]">
                👤
              </span>
              <span>Rezwan</span>
              <span className="text-[12px] text-[#818981]">⌄</span>
            </div>
          </div>
        </div>
        <nav className="border-t border-[#f0f3ef]">
          <div
            className={`${CONTAINER} flex items-center gap-6 overflow-x-auto py-3 text-[15px] whitespace-nowrap`}
          >
            <Link href="/" className="font-semibold text-[#21834a]">🏠 হোম</Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-[#48564b] transition hover:text-[#21834a]"
              >
                {category.icon} {category.nameBn}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="overflow-hidden border-b border-[#e3eae3] bg-[#f7faf7]">
        <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap py-2.5 text-[14px] text-[#58645a]">
          {[...products, ...products].map((product, index) => (
            <span key={`${product.id}-${index}`} className="flex items-center gap-2">
              <span>{product.image}</span>
              <span>{product.nameBn}</span>
              <span>{formatPrice(product.today)} টাকা/{formatUnit(product.unit)}</span>
              <span
                className={
                  product.change.dir === "up"
                    ? "font-bold text-[#dc4037]"
                    : product.change.dir === "down"
                      ? "font-bold text-[#168744]"
                      : "font-bold text-[#778078]"
                }
              >
                {product.change.dir === "up" ? "▲" : product.change.dir === "down" ? "▼" : "—"}
                {Math.abs(product.change.pct)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className={`${CONTAINER} pb-14`}>
        <section className="mt-6 grid min-h-[260px] grid-cols-1 items-center gap-6 overflow-hidden rounded-3xl border border-[#e4ebe4] bg-[#fbfdfb] px-6 py-8 sm:px-10 md:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-[#e7f5eb] px-3 py-1.5 text-[13px] font-semibold leading-none text-[#23874a]">
              শুক্রবার, ১০ অক্টোবর, ২০২৬
            </p>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[1.25] tracking-[-0.5px] text-[#202c23] sm:text-[40px]">
              আজকের বাজারের দাম এক নজরে
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.65] text-[#778078]">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক
              নির্ভরযোগ্য, সহজ, সর্বশেষ-সর্বাধিক তথ্য পেতে বাজার দেখুন।
            </p>
            <a
              href="#সব-পণ্য"
              className="mt-6 inline-flex rounded-lg bg-[#078b45] px-5 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#08763d]"
            >
              সব দাম দেখুন →
            </a>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/bazar-hero.png"
              alt="বাজারের তাজা পণ্য"
              width={320}
              height={250}
              priority
              className="h-auto max-h-[200px] w-full object-contain"
            />
          </div>
        </section>

        {apiError ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="text-base font-semibold text-red-700">পণ্যের তথ্য লোড করা যায়নি।</p>
            <p className="mt-2 text-sm text-gray-500">
              ইন্টারনেট সংযোগ পরীক্ষা করে পৃষ্ঠাটি আবার রিফ্রেশ করুন।
            </p>
          </div>
        ) : (
          <>
            <ProductSection title="আজ দাম বেড়েছে" products={risers} kind="up" />
            <ProductSection title="আজ দাম কমেছে" products={fallers} kind="down" />
            <ProductSection
              id="সব-পণ্য"
              title="সব পণ্য"
              subtitle="ছোট্ট একটি তালিকায় নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম"
              products={products}
            />
          </>
        )}
      </div>

      <footer className="border-t border-[#e2e9e2] bg-[#fbfdfb]">
        <div
          className={`${CONTAINER} flex flex-col gap-1 py-5 text-[13px] leading-5 text-[#69746b] sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
          <p>সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।</p>
        </div>
      </footer>
    </main>
  );
}