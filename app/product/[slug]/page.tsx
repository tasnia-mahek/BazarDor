"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
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

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#e4ebe4] ${className}`} />;
}

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params?.slug ?? ""));

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  // Protected route
  useEffect(() => {
    if (!isPending && !session) {
      toast.error("পণ্যের বিস্তারিত দেখতে আগে লগইন করুন", { id: "auth-redirect" });
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  const product = products.find((p) => p.slug === slug) ?? null;
  const category = product ? categories.find((c) => c.slug === product.category) : undefined;

  const markets = (product?.markets ?? []).map((m) => ({ ...m, avg: (m.min + m.max) / 2 }));
  const minPrice = markets.length ? Math.min(...markets.map((m) => m.min)) : product?.today ?? 0;
  const maxPrice = markets.length ? Math.max(...markets.map((m) => m.max)) : product?.today ?? 0;
  const avgPrice = product?.today ?? 0;

  const dir = product?.change.dir ?? "flat";
  const diff = product ? Math.abs(product.today - product.yesterday) : 0;
  const badgeClass =
    dir === "up" ? "text-[#dc4037]" : dir === "down" ? "text-[#168744]" : "text-[#667067]";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "—";

  const showSkeleton = isPending || !user || loading;

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

            {isPending || !user ? (
              <div className="flex items-center gap-2">
                <Pulse className="h-8 w-8 rounded-full" />
                <Pulse className="h-4 w-20" />
              </div>
            ) : (
              <UserMenu user={user} />
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
                  c.slug === product?.category
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
      <div className="flex-1 px-4 pb-16 pt-6">
        <div className="mx-auto w-full max-w-[1072px]">
          {showSkeleton ? (
            <div className="space-y-5">
              <Pulse className="h-4 w-56" />
              <Pulse className="h-[120px] w-full rounded-2xl" />
              <Pulse className="h-5 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Pulse className="h-[96px] rounded-2xl" />
                <Pulse className="h-[96px] rounded-2xl" />
                <Pulse className="h-[96px] rounded-2xl" />
              </div>
              <Pulse className="h-[320px] w-full rounded-2xl" />
            </div>
          ) : error || !product ? (
            <div className="mx-auto mt-16 max-w-[440px] rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-8 text-center">
              <p className="text-[56px] font-extrabold leading-none text-[#078b45]">৪০৪</p>
              <h1 className="mt-3 text-[20px] font-bold text-[#202c23]">
                {error ? "তথ্য লোড করা যায়নি" : "পণ্যটি খুঁজে পাওয়া যায়নি"}
              </h1>
              <p className="mt-2 text-[14px] text-[#778078]">
                {error
                  ? "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।"
                  : "আপনি যে পণ্যটি খুঁজছেন তা নেই বা সরানো হয়েছে।"}
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
              {/* Breadcrumb */}
              <nav className="flex flex-wrap items-center gap-2 text-[13px] text-[#778078]">
                <Link href="/" className="hover:text-[#078b45]">হোম</Link>
                <span>›</span>
                <Link href={`/category/${product.category}`} className="hover:text-[#078b45]">
                  {product.categoryNameBn}
                </Link>
                <span>›</span>
                <span className="font-medium text-[#253329]">{product.nameBn}</span>
              </nav>

              {/* Summary card */}
              <section className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[40px] leading-none">
                    {product.image}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-[26px] font-extrabold leading-tight text-[#202c23]">{product.nameBn}</h1>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-[#778078]">
                      <span>{formatUnit(product.unit)}</span>
                      <span>·</span>
                      <Link
                        href={`/category/${product.category}`}
                        className="rounded-full bg-[#e7f5eb] px-2.5 py-0.5 text-[12px] font-semibold text-[#23874a] hover:bg-[#d9f0df]"
                      >
                        {product.categoryIcon} {product.categoryNameBn}
                      </Link>
                    </div>
                    <p className="mt-1.5 text-[13px] text-[#48564b]">
                      {dir === "flat" ? (
                        "গতকালের তুলনায় আজ দাম অপরিবর্তিত"
                      ) : (
                        <>
                          গতকালের তুলনায় আজ দাম{" "}
                          <span className={`font-bold ${badgeClass}`}>{dir === "up" ? "বেড়েছে" : "কমেছে"}</span> :{" "}
                          {formatPrice(diff)} টাকা
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl bg-[#f0f5ef] px-7 py-3 text-center">
                  <p className="text-[12px] text-[#778078]">আজকের দাম</p>
                  <p className="text-[30px] font-extrabold leading-tight text-[#078b45]">{formatPrice(product.today)}</p>
                  <p className="text-[12px] text-[#778078]">টাকা / {unitShort(product.unit)}</p>
                  <p className={`mt-1 text-[12px] font-bold ${badgeClass}`}>
                    {arrow} {formatPct(product.change.pct)}%
                  </p>
                </div>
              </section>

              {/* Price summary */}
              <h2 className="mt-8 text-[18px] font-bold text-[#202c23]">দামের সারসংক্ষেপ</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-4">
                  <p className="text-[12px] text-[#778078]">সর্বনিম্ন দাম</p>
                  <p className="mt-1 text-[24px] font-extrabold text-[#168744]">
                    {formatPrice(minPrice)} <span className="text-[14px] font-semibold">টাকা</span>
                  </p>
                  <p className="mt-1 text-[12px] text-[#778078]">সবচেয়ে কম দামের বাজার</p>
                </div>
                <div className="rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-4">
                  <p className="text-[12px] text-[#778078]">সর্বাধিক দাম</p>
                  <p className="mt-1 text-[24px] font-extrabold text-[#dc4037]">
                    {formatPrice(maxPrice)} <span className="text-[14px] font-semibold">টাকা</span>
                  </p>
                  <p className="mt-1 text-[12px] text-[#778078]">সবচেয়ে বেশি দামের বাজার</p>
                </div>
                <div className="rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-4">
                  <p className="text-[12px] text-[#778078]">গড় দাম</p>
                  <p className="mt-1 text-[24px] font-extrabold text-[#202b23]">
                    {formatPrice(avgPrice)} <span className="text-[14px] font-semibold">টাকা</span>
                  </p>
                  <p className="mt-1 text-[12px] text-[#778078]">{formatUnit(product.unit)}-এর হিসাব</p>
                </div>
              </div>

              {/* Market table */}
              <h2 className="mt-8 text-[18px] font-bold text-[#202c23]">বাজারভিত্তিক আজকের দাম</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-[#e4ebe4] text-[13px] text-[#778078]">
                        <th className="px-4 py-3 font-medium">বাজার</th>
                        <th className="px-4 py-3 font-medium">বিভাগ</th>
                        <th className="px-4 py-3 text-right font-medium">সর্বনিম্ন</th>
                        <th className="px-4 py-3 text-right font-medium">সর্বাধিক</th>
                        <th className="px-4 py-3 text-right font-medium">গড়</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[#778078]">
                            এই পণ্যের বাজারভিত্তিক তথ্য পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        markets.map((m, i) => (
                          <tr key={`${m.market}-${i}`} className={i % 2 === 1 ? "bg-[#f3f7f3]" : ""}>
                            <td className="px-4 py-3 font-semibold text-[#202b23]">{m.market}</td>
                            <td className="px-4 py-3 text-[#48564b]">{m.division}</td>
                            <td className="px-4 py-3 text-right text-[#48564b]">{formatPrice(m.min)} টাকা</td>
                            <td className="px-4 py-3 text-right text-[#48564b]">{formatPrice(m.max)} টাকা</td>
                            <td className="px-4 py-3 text-right font-bold text-[#202b23]">{formatPrice(m.avg)} টাকা</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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