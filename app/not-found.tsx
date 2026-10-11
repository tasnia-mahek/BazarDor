import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f5f1] px-4 text-[#253329]">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#e4ebe4] bg-[#fbfdfb] p-8 text-center">
        <p className="text-[64px] font-extrabold leading-none text-[#078b45]">৪০৪</p>
        <h1 className="mt-3 text-[22px] font-bold text-[#202c23]">পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mt-2 text-[14px] text-[#778078]">
          আপনি যে পেজটি খুঁজছেন তা নেই বা সরানো হয়েছে।
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[#078b45] px-5 py-3 text-[14px] font-bold text-white shadow-md shadow-[#078b45]/30 transition hover:bg-[#08763d]"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}