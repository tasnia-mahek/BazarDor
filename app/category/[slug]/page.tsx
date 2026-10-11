"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { createAuthClient } from "better-auth/react";
import UserMenu from "@/components/UserMenu";
import {
  getProducts,
  getCategories,
  formatPrice,
  formatPct,
  formatUnit,
  unitShort,
  toBn,
  type Product,
  type Category,
} from "@/lib/api";

const authClient = createAuthClient();
const CONTAINER = "mx-auto w-full max-w-[1152px] px-4 sm:px-6";

type Sort = "default" | "asc" | "desc";

function ProductCard({ product }: { product: Product }) {
  const dir = product.change.dir;
  const changeClass =
    dir === "up"
      ? "bg-[#fff1ef] text-[#dc4037]"
      : dir === "down"
        ? "bg-[#eaf7ed] text-[#168744]"
        : "bg-[#f0f3ef] text-[#667067]";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "—";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex min-h-[116px] flex-col justify-between rounded-2xl border border-[#e2e9e2] bg-[#fbfdfb] px-4 py-3.5 transition-colors hover:border-[#b8d8bf] hover:bg-white"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ef] text-[22px] leading-none">
          {product.image}
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate text-[16px] font-bold leading-[1.35] text-[#29352c] group-hover:text-[#178342]">
            {product.nameBn}
          </h3>
          <p className="mt-0.5 text-[13px] leading-[1.3] text-[#7a827b]">{formatUnit(product.unit)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[12px] leading-[1.2] text-[#7b827c]">আজকের দাম</p>
          <p className="mt-0.5 text-[20px] font-bold leading-[1.2] text-[#202b23]">
            {formatPrice(product.today)} টাকা
          </p>
        </div>
        <span className={`mb-0.5 shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none ${changeClass}`}>
          {arrow} {formatPct(product.change.pct)}%
        </span>
      </div>
    </Link>
  );
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#e4ebe4] ${className}`} />;
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params?.slug ?? ""));
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>("default");
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
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const category = categories.find((c) => c.slug === slug);
  const list = products.filter((p) => p.category === slug);
  const sorted =
    sort === "asc"
      ? [...list].sort((a, b) => a.today - b.today)
      : sort === "desc"
        ? [...list].sort((a, b) => b.today - a.today)
        : list;

  const notFound = !loading && (error || !category || list.length === 0);

  return (
    <main className="flex min-h-screen flex-col bg-[#f0f5f1] text-[#253329]">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="border-b border-[#e8eee8] bg-[#fbfdfb]">
        <div className={CONTAINER}>
          <div className="flex h-[68px] items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-[#078b45]">
                <Image src="/logo-icon.png" alt="বাজার দর" width={40} height={40} priority className="h-full w-full object-cover" />
              </span>
              <span className="flex flex-col">
                <span className="text-[20px] font-bold leading-[1.15] text-[#1d2b22]">বাজার দর</span>
                <span className="mt-[3px] min-h-[12px] text-[12px] leading-none text-[#69746b]">{today}</span>
              </span>
            </Link>

            {isPending ? (
              <div className="flex items-center gap-4">
                <Pulse className="h-5 w-14" />
                <Pulse className="h-10 w-[92px]" />
              </div>
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-5">
                <Link href="/signin" className="text-[14px] font-semibold text-[#1d2b22] transition hover:text-[#078b45]">
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
          <div className={`${CONTAINER} flex min-h-[48px] items-center gap-3 overflow-x-auto py-2.5 text-[14px] whitespace-nowrap`}>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={
                  c.slug === slug
                    ? "rounded-full bg-[#078b45] px-4 py-1.5 font-semibold text-white"
                    : "rounded-full px-4 py-1.5 text-[#48564b] transition hover:text-[#21834a]"
                }
              >
                {c.icon} {c.nameBn}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Ticker */}
      <div className="min-h-[42px] overflow-hidden border-b border-[#e3eae3] bg-[#f7faf7]">
        <div className="ticker-track flex w-max items-center whitespace-nowrap py-2.5 text-[14px] text-[#58645a]">
          {[...products, ...products].map((item, index) => (
            <span key={`${item.id}-${index}`} className="flex items-center gap-2 border-r border-[#e3eae3] px-4">
              <span>{item.image}</span>
              <span>{item.nameBn}</span>
              <span>
                {formatPrice(item.today)} টাকা/{unitShort(item.unit)}
              </span>
              <span
                className={
                  item.change.dir === "up"
                    ? "font-bold text-[#dc4037]"
                    : item.change.dir === "down"
                      ? "font-bold text-[#168744]"
                      : "font-bold text-[#778078]"
                }
              >
                {item.change.dir === "up" ? "▲" : item.change.dir === "down" ? "▼" : "—"}
                {formatPct(item.change.pct)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-16 pt-8">
        <div className={CONTAINER}>
          {loading ? (
            <div className="space-y-5">
              <Pulse className="h-[96px] w-full rounded-2xl" />
              <Pulse className="h-[64px] w-full rounded-2xl" />
              <Pulse className="h-4 w-48" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Pulse key={i} className="h-[116px] rounded-2xl" />
                ))}
              </div>
            </div>
          ) : notFound ? (
            <div className="mx-auto mt-10 max-w-[440px] rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-8 text-center">
              <p className="text-[56px] font-extrabold leading-none text-[#078b45]">৪০৪</p>
              <h1 className="mt-3 text-[20px] font-bold text-[#202c23]">
                {error ? "তথ্য লোড করা যায়নি" : "কোনো পণ্য পাওয়া যায়নি"}
              </h1>
              <p className="mt-2 text-[14px] text-[#778078]">
                {error
                  ? "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।"
                  : "এই ক্যাটাগরিতে কোনো পণ্য নেই অথবা ক্যাটাগরিটি সঠিক নয়।"}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-lg bg-[#078b45] px-5 py-3 text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d]"
              >
                হোম পেজে ফিরে যান
              </Link>
            </div>
          ) : (
            <>
              {/* Title card */}
              <section className="flex items-center gap-4 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[32px] leading-none">
                  {category!.icon}
                </span>
                <div>
                  <h1 className="text-[28px] font-extrabold leading-tight text-[#202c23]">{category!.nameBn}</h1>
                  <p className="mt-0.5 text-[14px] text-[#778078]">{toBn(list.length)}টি পণ্যের আজকের দাম ও পরিবর্তন</p>
                </div>
              </section>

              {/* Sort bar */}
              <section className="mt-4 flex items-center justify-end gap-3 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] px-5 py-4">
                <label htmlFor="sort" className="text-[14px] text-[#778078]">সাজান:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-9 rounded-lg border border-[#e2e9e2] bg-white px-3 text-[14px] text-[#202b23] outline-none focus:border-[#078b45] focus:ring-2 focus:ring-[#078b45]/15"
                >
                  <option value="default">ডিফল্ট</option>
                  <option value="asc">দাম: কম থেকে বেশি</option>
                  <option value="desc">দাম: বেশি থেকে কম</option>
                </select>
              </section>

              <p className="mt-5 text-[13px] text-[#778078]">মোট {toBn(sorted.length)}টি পণ্য দেখানো হচ্ছে</p>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e2e9e2] bg-[#fbfdfb]">
        <div className={`${CONTAINER} flex flex-col gap-1 py-6 text-[13px] leading-5 text-[#48564b] sm:flex-row sm:items-center sm:justify-between`}>
          <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
          <p>সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।</p>
        </div>
      </footer>
    </main>
  );
}