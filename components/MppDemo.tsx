"use client";

import { useState } from "react";

const UNIT_PRICE = 0.05;

type Tab = "cli" | "agent" | "claude";

const TAB_ORDER: Tab[] = ["agent", "claude", "cli"];

const TAB_LABELS: Record<Tab, string> = {
  agent: "tempo wallet",
  claude: "Claude prompt",
  cli: "npx mppx",
};

export function MppDemo() {
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("agent");
  const total = (quantity * UNIT_PRICE).toFixed(2);

  const url = `https://matthewslater.xyz/api/mpp/widgets?quantity=${quantity}`;

  return (
    <div className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-6 py-5">
      {/* Product row */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="shrink-0 w-12 h-12 rounded border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Machine Payments with Tempo Wallet Crypto</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">0.05 usd / token · Tempo stablecoin</p>
        </div>
      </div>

      {/* Quantity + price */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-6 h-6 rounded border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors flex items-center justify-center text-xs"
            >
              −
            </button>
            <span className="text-sm text-gray-900 dark:text-white w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-6 h-6 rounded border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>
        </div>
        <span className="text-sm text-gray-900 dark:text-white">{total} usd</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TAB_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest transition-colors ${
              tab === t
                ? "bg-black/[0.08] dark:bg-white/[0.08] text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 mb-5">
        {tab === "cli" && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">For developers · mppx CLI</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">1. Install</p>
              <code className="text-xs text-gray-500 dark:text-gray-400">npm install -g mppx</code>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">2. Create account</p>
              <code className="text-xs text-gray-500 dark:text-gray-400">mppx account create</code>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">3. Make paid request</p>
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all">mppx {url}</code>
            </div>
          </div>
        )}

        {tab === "agent" && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">For AI agents · Tempo Wallet</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">1. Install</p>
              <code className="text-xs text-gray-500 dark:text-gray-400">curl -fsSL https://tempo.xyz/install | bash</code>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">2. Connect wallet</p>
              <code className="text-xs text-gray-500 dark:text-gray-400">tempo wallet login</code>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">3. Make paid request</p>
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all">tempo request {url}</code>
            </div>
          </div>
        )}

        {tab === "claude" && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">Paste into Claude Code</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">1. Set up Tempo</p>
              <code className="text-xs text-gray-500 dark:text-gray-400">Read https://tempo.xyz/SKILL.md and set up tempo</code>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-600">2. Make paid request</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                Use <code className="text-gray-500 dark:text-gray-400">tempo request</code> to buy {quantity} widget token{quantity !== 1 ? "s" : ""} from{" "}
                <code className="text-gray-500 dark:text-gray-400 break-all">{url}</code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment method + endpoint */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">HTTP 402 · MPP · Pay-per-request</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-700 font-mono">GET /api/mpp/widgets?quantity={quantity}</p>
          <a
            href="https://explore.mainnet.tempo.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors w-fit"
          >
            Tempo Explorer ↗
          </a>
        </div>
        <a
          href={`/api/mpp/widgets?quantity=${quantity}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40"
        >
          See 402 →
        </a>
      </div>
    </div>
  );
}
