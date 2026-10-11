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

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [today, setToday] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newName = (name ?? user?.name ?? "").trim();

    if (!newName) {
      toast.error("আপনার নাম লিখুন");
      return;
    }
    if (newName === user?.name) {
      toast.error("নামে কোনো পরিবর্তন নেই");
      return;
    }

    setSaving(true);
    const { error } = await authClient.updateUser({ name: newName });
    setSaving(false);

    if (error) {
      toast.error(error.message || "নাম আপডেট করা যায়নি");
      return;
    }

    toast.success("তথ্য সফলভাবে আপডেট হয়েছে");
    router.push("/profile");
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
                <Image src="/logo-icon.png" alt="বাজার দর" width={40} height={40} priority className="h-full w-full object-cover" />
              </span>
              <span className="flex flex-col">
                <span className="text-[20px] font-bold leading-[1.15] text-[#1d2b22]">বাজার দর</span>
                <span className="mt-[3px] min-h-[12px] text-[12px] leading-none text-[#69746b]">{today}</span>
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
          <div className={`${CONTAINER} flex min-h-[48px] items-center gap-3 overflow-x-auto py-2.5 text-[14px] whitespace-nowrap`}>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full px-4 py-1.5 text-[#48564b] transition hover:text-[#21834a]"
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
      <div className="flex-1 px-4 pb-16 pt-10">
        <div className="mx-auto w-full max-w-[416px]">
          <h1 className="text-center text-[28px] font-extrabold leading-tight text-[#202c23]">
            তথ্য আপডেট করুন
          </h1>
          <p className="mt-2 text-center text-[14px] text-[#778078]">
            আপনার নাম পরিবর্তন করে সেভ করুন।
          </p>

          <div className="mt-8 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-6">
            {showSkeleton ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-12 animate-pulse rounded bg-[#e4ebe4]" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-[#e4ebe4]" />
                </div>
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#cfe3d4]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[14px] font-medium text-[#253329]">
                    নাম
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name ?? user.name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#e2e9e2] bg-white px-3 text-[14px] text-[#202b23] outline-none placeholder:text-[#9aa39b] focus:border-[#078b45] focus:ring-2 focus:ring-[#078b45]/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 w-full rounded-lg bg-[#078b45] text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d] disabled:opacity-60"
                >
                  {saving ? "অপেক্ষা করুন..." : "তথ্য আপডেট করুন"}
                </button>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#9aa39b]">
            <Link href="/profile" className="transition hover:text-[#078b45]">
              ← প্রোফাইলে ফিরে যান
            </Link>
          </p>
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