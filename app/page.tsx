"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import UserMenu from "@/components/UserMenu";
import {
  getProducts,
  getCategories,
  formatPrice,
  formatPct,
  formatUnit,
  unitShort,
  type Product,
  type Category,
} from "@/lib/api";

const authClient = createAuthClient();

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
          {arrow} {formatPct(product.change.pct)}%
        </span>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="min-h-[116px] animate-pulse rounded-2xl border border-[#e2e9e2] bg-[#fbfdfb] p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#e4ebe4]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-[#e4ebe4]" />
          <div className="h-3 w-16 rounded bg-[#e4ebe4]" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="h-6 w-20 rounded bg-[#e4ebe4]" />
        <div className="h-5 w-14 rounded-full bg-[#e4ebe4]" />
      </div>
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  id,
  kind = "default",
  loading,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  id?: string;
  kind?: "up" | "down" | "default";
  loading: boolean;
}) {
  if (!loading && !products.length) return null;

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
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

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
      {/* Header */}
      <header className="border-b border-[#e8eee8] bg-[#fbfdfb]">
        <div className={CONTAINER}>
          <div className="flex h-[68px] items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-[#078b45]">
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
                <span className="mt-[3px] min-h-[12px] text-[12px] leading-none text-[#69746b]">
                  {today}
                </span>
              </span>
            </Link>

            {isPending ? (
              <div className="flex items-center gap-4">
                <div className="h-5 w-14 animate-pulse rounded bg-[#e4ebe4]" />
                <div className="h-10 w-[92px] animate-pulse rounded-lg bg-[#e4ebe4]" />
              </div>
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  href="/signin"
                  className="text-[14px] font-semibold text-[#1d2b22] transition hover:text-[#078b45]"
                >
                  সাইন ইন
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#078b45] px-5 py-2.5 text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d]"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>
        </div>
        <nav className="border-t border-[#f0f3ef]">
          <div
            className={`${CONTAINER} flex min-h-[48px] items-center gap-3 overflow-x-auto py-2.5 text-[14px] whitespace-nowrap`}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-full px-4 py-1.5 text-[#48564b] transition hover:text-[#21834a]"
              >
                {category.icon} {category.nameBn}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Ticker */}
      <div className="min-h-[42px] overflow-hidden border-b border-[#e3eae3] bg-[#f7faf7]">
        <div className="ticker-track flex w-max items-center whitespace-nowrap py-2.5 text-[14px] text-[#58645a]">
          {[...products, ...products].map((product, index) => (
            <span
              key={`${product.id}-${index}`}
              className="flex items-center gap-2 border-r border-[#e3eae3] px-4"
            >
              <span>{product.image}</span>
              <span>{product.nameBn}</span>
              <span>
                {formatPrice(product.today)} টাকা/{unitShort(product.unit)}
              </span>
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
                {formatPct(product.change.pct)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={`${CONTAINER} pb-14`}>
        <section className="mt-6 grid min-h-[260px] grid-cols-1 items-center gap-6 overflow-hidden rounded-3xl border border-[#e4ebe4] bg-[#fbfdfb] px-6 py-8 sm:px-10 md:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <p className="inline-flex min-h-[28px] rounded-full bg-[#e7f5eb] px-3 py-1.5 text-[13px] font-semibold leading-none text-[#23874a]">
              {today}
            </p>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[1.25] tracking-[-0.5px] text-[#202c23] sm:text-[40px]">
              আজকের বাজারের দাম এক নজরে
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.65] text-[#778078]">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক নির্ভরযোগ্য, গড়, সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।
            </p>
            <a
              href="#সব-পণ্য"
              className="mt-6 inline-flex rounded-lg bg-[#078b45] px-5 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#08763d]"
            >
              সব পণ্য দেখুন →
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
            <ProductSection title="আজ দাম বেড়েছে" products={risers} kind="up" loading={loading} />
            <ProductSection title="আজ দাম কমেছে" products={fallers} kind="down" loading={loading} />
            <ProductSection
              id="সব-পণ্য"
              title="সব পণ্য"
              subtitle="ছোট্ট একটি তালিকায় নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম"
              products={products}
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Footer */}
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