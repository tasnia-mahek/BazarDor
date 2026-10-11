"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { createAuthClient } from "better-auth/react";
import {
  getProducts,
  getCategories,
  formatPrice,
  formatUnit,
  type Product,
} from "@/lib/api";

const authClient = createAuthClient();

const CONTAINER = "mx-auto w-full max-w-[1152px] px-4 sm:px-6";
const label = "mb-1.5 block text-[14px] font-medium text-[#253329]";
const input =
  "h-10 w-full rounded-lg border border-[#e2e9e2] bg-white px-3 text-[14px] text-[#202b23] outline-none placeholder:text-[#9aa39b] focus:border-[#078b45] focus:ring-2 focus:ring-[#078b45]/15";
const socialBtn =
  "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#e2e9e2] bg-white px-2 text-[13px] font-semibold text-[#253329] transition hover:border-[#b8d8bf] disabled:opacity-60";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(false);
  const [social, setSocial] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");

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
    if (session) router.replace("/");
  }, [session, router]);

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("সফলভাবে লগআউট হয়েছে");
          router.refresh();
        },
        onError: () => {
          toast.error("লগআউট করা যায়নি");
        },
      },
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    let validation = "";
    if (!/^\S+@\S+\.\S+$/.test(email)) validation = "সঠিক ইমেইল দিন";
    else if (!password) validation = "পাসওয়ার্ড লিখুন";

    if (validation) {
      setError(validation);
      toast.error(validation);
      return;
    }

    setLoading(true);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (err) {
      const msg = err.message || "ইমেইল বা পাসওয়ার্ড সঠিক নয়";
      setError(msg);
      toast.error(msg);
      return;
    }

    toast.success("সফলভাবে লগইন হয়েছে");
    router.push("/");
    router.refresh();
  }

  async function handleSocial(provider: "google" | "github") {
    setSocial(provider);
    const { error: err } = await authClient.signIn.social({ provider, callbackURL: "/" });
    if (err) {
      toast.error(err.message || "সোশ্যাল লগইন ব্যর্থ হয়েছে");
      setSocial(null);
    }
  }

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
                <span className="text-[20px] font-bold leading-[1.15] text-[#1d2b22]">বাজার দর</span>
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
            ) : session ? (
              <div className="flex items-center gap-3 text-[14px] text-[#303b32]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8ece8] text-[16px]">
                  👤
                </span>
                <span className="font-medium">{session.user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-[#e2e9e2] px-3 py-1.5 text-[13px] font-semibold text-[#48564b] transition hover:border-[#b8d8bf] hover:text-[#078b45]"
                >
                  লগআউট
                </button>
              </div>
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
          <div className={`${CONTAINER} flex min-h-[48px] items-center gap-8 overflow-x-auto py-3.5 text-[14px] whitespace-nowrap`}>
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

      {/* Ticker */}
      <div className="min-h-[42px] overflow-hidden border-b border-[#e3eae3] bg-[#f7faf7]">
        <div className="ticker-track flex w-max items-center whitespace-nowrap py-2.5 text-[14px] text-[#58645a]">
          {[...products, ...products].map((product, index) => (
            <span key={`${product.id}-${index}`} className="flex items-center gap-2 border-r border-[#e3eae3] px-4">
              <span>{product.image}</span>
              <span>{product.nameBn}</span>
              <span>
                {formatPrice(product.today)} টাকা/{formatUnit(product.unit)}
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
                {Math.abs(product.change.pct)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 pb-16 pt-10">
        <div className="mx-auto w-full max-w-[416px]">
          <h1 className="text-center text-[28px] font-extrabold leading-tight text-[#202c23]">
            সাইন ইন
          </h1>
          <p className="mt-2 text-center text-[14px] text-[#778078]">
            বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে ঢুকুন।
          </p>

          <div className="mt-8 rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-6">
            {isPending || session ? (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#e4ebe4]" />
                    <div className="h-10 w-full animate-pulse rounded-lg bg-[#e4ebe4]" />
                  </div>
                ))}
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#cfe3d4]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className={label}>ইমেইল</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" className={input} />
                </div>
                <div>
                  <label htmlFor="password" className={label}>পাসওয়ার্ড</label>
                  <input id="password" name="password" type="password" placeholder="কমপক্ষে ৮ অক্ষর" className={input} />
                </div>

                {error && (
                  <p className="rounded-lg bg-[#fff1ef] px-3 py-2 text-[13px] text-[#dc4037]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-lg bg-[#078b45] text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d] disabled:opacity-60"
                >
                  {loading ? "অপেক্ষা করুন..." : "সাইন ইন"}
                </button>

                <div className="flex items-center gap-3 text-[12px] text-[#7a837b]">
                  <span className="h-px flex-1 bg-[#e2e9e2]" />
                  অথবা
                  <span className="h-px flex-1 bg-[#e2e9e2]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className={socialBtn} disabled={social !== null} onClick={() => handleSocial("google")}>
                    <svg width="16" height="16" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
                      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                    </svg>
                    {social === "google" ? "অপেক্ষা করুন..." : "Google দিয়ে চালিয়ে যান"}
                  </button>
                  <button type="button" className={socialBtn} disabled={social !== null} onClick={() => handleSocial("github")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z" />
                    </svg>
                    {social === "github" ? "অপেক্ষা করুন..." : "GitHub দিয়ে চালিয়ে যান"}
                  </button>
                </div>

                <p className="pt-1 text-center text-[14px] text-[#48564b]">
                  অ্যাকাউন্ট নেই?{" "}
                  <Link href="/signup" className="font-semibold text-[#078b45] hover:underline">
                    সাইন আপ করুন
                  </Link>
                </p>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#9aa39b]">
            <Link href="/" className="transition hover:text-[#078b45]">
              ← হোম পেজে ফিরে যান
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