"use client";

import { useState, useEffect, useRef } from "react";

const UNIT_PRICE = 0.05;

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "awaiting_payment";
      deposit_address: string;
      network: string;
      amount_usd: string;
      payment_intent_id: string;
      supported_tokens: Array<{ token_currency: string; token_contract_address: string }>;
    }
  | {
      status: "confirmed";
      payment_intent_id: string;
      amount_usd: string;
    }
  | { status: "error"; message: string };

const ROLES = [
  {
    label: "Merchant",
    description: "Your server calls Stripe and receives a unique deposit address per payment.",
  },
  {
    label: "Stripe",
    description: "Monitors the Tempo network for incoming USDC. Settles you in USD.",
  },
  {
    label: "Buyer",
    description: "Sends USDC to the deposit address from any Tempo wallet.",
  },
];

export function StripeCryptoDemo() {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<State>({ status: "idle" });
  const [selectedToken, setSelectedToken] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = (quantity * UNIT_PRICE).toFixed(2);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/stripe/mpp-crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: quantity * 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate deposit address");

      setSelectedToken(0);
      setState({
        status: "awaiting_payment",
        deposit_address: data.deposit_address,
        network: data.network ?? "Tempo",
        amount_usd: data.amount_usd,
        payment_intent_id: data.payment_intent_id,
        supported_tokens: data.supported_tokens ?? [],
      });

      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/stripe/mpp-crypto?pi=${data.payment_intent_id}`);
        const d = await r.json();
        if (d.status === "succeeded") {
          clearInterval(pollRef.current!);
          setState({
            status: "confirmed",
            payment_intent_id: data.payment_intent_id,
            amount_usd: data.amount_usd,
          });
        }
      }, 3000);
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  function reset() {
    if (pollRef.current) clearInterval(pollRef.current);
    setSelectedToken(0);
    setState({ status: "idle" });
  }

  return (
    <div className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-6 py-5">

      {/* Product row */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="shrink-0 w-12 h-12 rounded border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <path d="M12 7c-2.5 0-4 1.5-4 3s1.5 2.5 4 2.5S16 13.5 16 12 14.5 7 12 7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe Machine Payments · Crypto</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">0.05 usd / token · USDC on Tempo · settled in USD by Stripe</p>
        </div>
      </div>

      {(state.status === "idle" || state.status === "loading") && (
        <>
          {/* Role explanation */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {ROLES.map(({ label, description }) => (
              <div
                key={label}
                className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1.5">{label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-300 dark:text-gray-700 mb-5">
            In this demo you play both merchant and buyer.
          </p>

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

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Machine Payments · Crypto · Stripe-managed address</p>
            <button
              onClick={generate}
              disabled={state.status === "loading"}
              className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state.status === "loading" ? "Generating…" : "Generate address →"}
            </button>
          </div>
        </>
      )}

      {state.status === "awaiting_payment" && (
        <>
          <div className="flex flex-col gap-2 mb-5">

            {/* Merchant step */}
            <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                1 · Merchant — PaymentIntent created
              </p>
              <p className="text-xs text-gray-500 font-mono">{state.payment_intent_id}</p>
            </div>

            {/* Stripe step */}
            <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                2 · Stripe — deposit address · {state.network} network
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">{state.deposit_address}</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-1.5">
                Stripe monitors this address and auto-captures when USDC arrives.
              </p>
            </div>

            {/* Buyer step */}
            <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                3 · Buyer — send payment
              </p>
              {state.supported_tokens.length > 1 && (
                <div className="flex gap-1 mb-2">
                  {state.supported_tokens.map((t, i) => (
                    <button
                      key={t.token_contract_address}
                      onClick={() => setSelectedToken(i)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border transition-colors ${
                        selectedToken === i
                          ? "border-black/30 dark:border-white/30 text-gray-900 dark:text-white"
                          : "border-black/[0.08] dark:border-white/[0.08] text-gray-400 dark:text-gray-600 hover:border-black/20 dark:hover:border-white/20"
                      }`}
                    >
                      {t.token_currency}
                    </button>
                  ))}
                </div>
              )}
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                tempo wallet transfer {state.amount_usd}{" "}
                {state.supported_tokens[selectedToken]?.token_contract_address ?? "USDC"}{" "}
                {state.deposit_address}
              </code>
              <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-1.5">
                Send {state.supported_tokens[selectedToken]?.token_currency ?? "USDC"} on Tempo to complete the payment.
              </p>
            </div>

          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Waiting for on-chain confirmation…
            </p>
            <button
              onClick={reset}
              className="ml-8 shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 transition-colors duration-200 hover:border-black/20 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {state.status === "confirmed" && (
        <>
          <div className="flex flex-col gap-2 mb-5">
            <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                Payment confirmed
              </p>
              <p className="text-xs text-gray-500 font-mono">{state.payment_intent_id}</p>
            </div>
            <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                Stripe settled
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{state.amount_usd} usd · buyer paid USDC · merchant receives USD</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
              Succeeded
            </p>
            <button
              onClick={reset}
              className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40"
            >
              New payment
            </button>
          </div>
        </>
      )}

      {state.status === "error" && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">{state.message}</p>
      )}

    </div>
  );
}
