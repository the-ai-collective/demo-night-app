"use client";

import Logos from "~/components/Logos";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center pb-16 font-kallisto text-black">
      <Logos size={120} />
      <h1 className="pt-4 text-center text-2xl font-semibold">
        Something went wrong 🥲
      </h1>
      <p className="text-lg font-semibold italic">(hang with us!)</p>
      <button
        className="mt-4 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white shadow-xl hover:bg-green-600"
        onClick={() => window.location.reload()}
      >
        Refresh page
      </button>
    </main>
  );
}
