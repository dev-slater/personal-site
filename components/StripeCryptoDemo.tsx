"use client";

import { useState } from "react";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      deposit_address: string | null;
      supported_tokens: Array<{ token_currency: string; token_contract_address: string }>;
      network: string;
      amount_usd: string;
      payment_intent_id: string;
    }
  | { status: "error"; message: string };

export function StripeCryptoDemo() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/stripe/mpp-crypto", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate deposit address");
      setState({
        status: "success",
        deposit_address: data.deposit_address,
        supported_tokens: data.supported_tokens ?? [],
        network: data.network ?? "Tempo",
        amount_usd: data.amount_usd,
        payment_intent_id: data.payment_intent_id,
      });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return (
    <div className="rounded-lg border border-white/[0.08] px-6 py-5">
      {/* Product row */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-white/[0.06]">
        <div className="shrink-0 w-12 h-12 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <path d="M12 7c-2.5 0-4 1.5-4 3s1.5 2.5 4 2.5S16 13.5 16 12 14.5 7 12 7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Stripe Machine Payments</p>
          <p className="text-xs text-gray-600 font-mono mt-0.5">0.10 usd · crypto · Tempo network</p>
        </div>
        <p className="ml-auto text-sm text-white">0.10 usd</p>
      </div>

      {state.status === "success" ? (
        <div className="mb-5">
          <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
              Deposit address · {state.network} network
            </p>
            <p className="text-xs text-gray-300 font-mono break-all">
              {state.deposit_address ?? "—"}
            </p>
          </div>

          {state.supported_tokens.length > 0 && (
            <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                Accepted tokens
              </p>
              {state.supported_tokens.map((t) => (
                <p key={t.token_contract_address} className="text-xs text-gray-400 font-mono">
                  {t.token_currency.toUpperCase()}{" "}
                  <span className="text-gray-700 break-all">{t.token_contract_address}</span>
                </p>
              ))}
            </div>
          )}

          <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
              PaymentIntent
            </p>
            <p className="text-xs text-gray-500 font-mono">{state.payment_intent_id}</p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3 mt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">How to pay</p>
            <code className="text-xs text-gray-300 break-all">
              tempo wallet send {state.deposit_address ?? "<address>"} {state.amount_usd}
            </code>
            <p className="text-[10px] text-gray-700 mt-1.5">
              Stripe monitors Tempo and auto-captures when the transfer confirms.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-5">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">How it works</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Stripe creates a unique deposit address per payment. Send stablecoin to it — Stripe
            monitors on-chain and automatically captures the PaymentIntent when your transfer
            confirms. No SPT or card required.
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Machine Payments · Crypto · Stripe-managed address</p>
        {state.status === "success" ? (
          <button
            onClick={generate}
            className="ml-8 shrink-0 rounded-full border border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-500 transition-colors duration-200 hover:border-white/20 hover:text-gray-300"
          >
            New address
          </button>
        ) : (
          <button
            onClick={generate}
            disabled={state.status === "loading"}
            className="ml-8 shrink-0 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white transition-colors duration-200 hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {state.status === "loading" ? "Generating…" : "Generate address →"}
          </button>
        )}
      </div>

      {state.status === "error" && (
        <p className="mt-3 text-xs text-red-400">{state.message}</p>
      )}
    </div>
  );
}
