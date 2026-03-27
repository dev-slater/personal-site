"use client";

import { useState } from "react";

const UNIT_PRICE = 0.05;

export function MppDemo() {
  const [quantity, setQuantity] = useState(1);
  const total = (quantity * UNIT_PRICE).toFixed(2);

  return (
    <div className="rounded-lg border border-white/[0.08] px-6 py-5">
      {/* Product row */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-white/[0.06]">
        <div className="shrink-0 w-12 h-12 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">ms_dev Widget Token</p>
          <p className="text-xs text-gray-600 font-mono mt-0.5">0.05 usd / token · Tempo USDC or Stripe card</p>
        </div>
      </div>

      {/* Quantity + price */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-6 h-6 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center text-xs"
            >
              −
            </button>
            <span className="text-sm text-white w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-6 h-6 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>
        </div>
        <span className="text-sm text-white">{total} usd</span>
      </div>

      {/* CLI instructions */}
      <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-5">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Try it via CLI</p>
        <code className="text-xs text-gray-300 break-all">
          npx mppx https://matthewslater.xyz/api/mpp/widgets?quantity={quantity}
        </code>
      </div>

      {/* Payment method + endpoint */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">HTTP 402 · MPP · Pay-per-request</p>
          <p className="text-[10px] text-gray-700 font-mono">GET /api/mpp/widgets?quantity={quantity}</p>
        </div>
        <a
          href={`/api/mpp/widgets?quantity=${quantity}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-8 shrink-0 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white transition-colors duration-200 hover:border-white/40"
        >
          See 402 →
        </a>
      </div>
    </div>
  );
}
