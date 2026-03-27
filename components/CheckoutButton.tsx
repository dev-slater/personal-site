"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="ml-8 mt-0.5 shrink-0 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white transition-colors duration-200 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "..." : "Buy — $1"}
    </button>
  );
}
