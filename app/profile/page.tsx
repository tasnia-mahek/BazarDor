"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { createAuthClient } from "better-auth/react";
import UserMenu from "@/components/UserMenu";
import {
  getProducts,
  getCategories,
  formatPrice,
  formatPct,
  unitShort,
  type Product,
  type Category,
} from "@/lib/api";

const authClient = createAuthClient();

const CONTAINER = "mx-auto w-full max-w-[1152px] px-4 sm:px-6";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [today, setToday] = useState("");
  const [signingOut, setSigningOut] = useState(false);

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
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      toast.error("এই পেজ দেখতে আগে লগইন করুন", { id: "auth-redirect" });
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await authClient.signOut();

    if (error) {
      setSigningOut(false);
      toast.error(error.message || "সাইন আউট করা যায়নি");
      return;
    }

    toast.success("সফলভাবে সাইন আউট হয়েছে");
    router.replace("/signin");
    router.refresh();
  }

  const showSkeleton = isPending || !user;

  return (
    <main className="flex min-h-screen flex-col bg-[#f0f5f1] text-[#253329]">
      <Toaster position="top-center" />

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

            {showSkeleton ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-[#e4ebe4]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#e4ebe4]" />
              </div>
            ) : (
              <UserMenu user={user} />
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

      {/* Content: narrow centered column like Figma */}
      <div className="flex-1 px-4 pb-16 pt-10">
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="text-[26px] font-extrabold leading-tight text-[#202c23]">
            আমার প্রোফাইল
          </h1>
          <p className="mt-1 text-[14px] text-[#778078]">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>

          {/* User card */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-5">
            {showSkeleton ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-[#e4ebe4]" />
                  <div className="space-y-2">
                    <div className="h-5 w-36 animate-pulse rounded bg-[#e4ebe4]" />
                    <div className="h-4 w-48 animate-pulse rounded bg-[#e4ebe4]" />
                  </div>
                </div>
                <div className="h-9 w-24 animate-pulse rounded-lg bg-[#e4ebe4]" />
              </>
            ) : (
              <>
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8ece8] text-[24px]">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold text-[#202b23]">{user.name}</p>
                    <p className="truncate text-[14px] text-[#778078]">{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dc4037] bg-white px-4 py-2 text-[14px] font-semibold text-[#dc4037] transition hover:bg-[#fff1ef] disabled:opacity-60"
                >
                  <span aria-hidden>↩</span>
                  {signingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
                </button>
              </>
            )}
          </div>

          {/* Info card */}
          <div className="mt-5 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-6">
            <h2 className="text-[16px] font-bold text-[#202b23]">তথ্য</h2>

            {showSkeleton ? (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-12 animate-pulse rounded bg-[#e4ebe4]" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-[#e4ebe4]" />
                </div>
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#cfe3d4]" />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-1.5 text-[14px] font-medium text-[#253329]">নাম</p>
                  <div className="flex h-10 w-full items-center rounded-lg border border-[#e2e9e2] bg-white px-3 text-[14px] text-[#202b23]">
                    {user.name}
                  </div>
                </div>

                <Link
                  href="/profile/update"
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-[#078b45] text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d]"
                >
                  আপডেট
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e2e9e2] bg-[#fbfdfb]">
        <div
          className={`${CONTAINER} flex flex-col gap-1 py-6 text-[13px] leading-5 text-[#48564b] sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
          <p>সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।</p>
        </div>
      </footer>
    </main>
  );
}