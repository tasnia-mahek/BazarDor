"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

type MenuUser = { name: string; email: string; image?: string | null };

export default function UserMenu({ user }: { user: MenuUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    const { error } = await authClient.signOut();
    if (error) {
      setBusy(false);
      toast.error(error.message || "সাইন আউট করা যায়নি");
      return;
    }
    toast.success("সফলভাবে সাইন আউট হয়েছে");
    router.replace("/signin");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="group relative">
      
      <Link
        href="/profile"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-[14px] text-[#303b32] transition hover:bg-[#f0f5f1]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8ece8] text-[16px]">
          {user.image ? (
           
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            "👤"
          )}
        </span>
        <span className="max-w-[120px] truncate font-medium">{firstName}</span>
        <span className="text-[9px] text-[#818981]">▾</span>
      </Link>

      {/* Dropdown (pt-2 keeps the hover alive while moving the mouse down) */}
      <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div
          role="menu"
          className="w-[255px] rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] px-5 pb-6 pt-5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
        >
          <p className="truncate text-[15px] font-semibold text-[#202b23]">{user.name}</p>
          <p className="mt-0.5 truncate text-[13px] text-[#778078]">{user.email}</p>

          <Link
            href="/profile"
            role="menuitem"
            className="mt-4 flex items-center gap-2 text-[14px] text-[#253329] transition hover:text-[#078b45]"
          >
            <span aria-hidden className="text-[13px]">👤</span> আমার প্রোফাইল
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={busy}
            className="mt-4 flex items-center gap-2 text-[14px] text-[#dc4037] transition hover:opacity-80 disabled:opacity-60"
          >
            <span aria-hidden>↩</span> {busy ? "অপেক্ষা করুন..." : "সাইন আউট"}
          </button>
        </div>
      </div>
    </div>
  );
}