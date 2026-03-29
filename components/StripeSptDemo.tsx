"use client";

import { useState } from "react";

const profileId = process.env.NEXT_PUBLIC_STRIPE_PROFILE_ID;

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      token: string;
      usage_limits: { currency: string; max_amount: number; expires_at: number };
      example_cli: string;
    }
  | { status: "error"; message: string };

export function StripeSptDemo() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/stripe/mpp-spt", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate token");
      setState({
        status: "success",
        token: data.token,
        usage_limits: data.usage_limits,
        example_cli: data.example_cli,
      });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return (
    <div className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-6 py-5">
      {/* Product row */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="shrink-0 w-12 h-12 rounded border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe Machine Payments</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">card · Shared Payment Token (SPT)</p>
        </div>
      </div>

      {/* Pending activation state */}
      {!profileId ? (
        <>
          <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">The pattern</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Initialize <span className="font-mono text-gray-600 dark:text-gray-400">mppx/client</span> once with
              your card. It wraps <span className="font-mono text-gray-600 dark:text-gray-400">globalThis.fetch</span>{" "}
              — from then on, any <span className="font-mono text-gray-600 dark:text-gray-400">fetch()</span> call
              that hits a paid endpoint automatically negotiates payment and retries. No per-request
              payment logic in your code.
            </p>
          </div>

          <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 mb-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">The flow</p>
            <div className="flex flex-col gap-1 text-xs text-gray-500 font-mono">
              <span>1. Card → Stripe Elements → <span className="text-gray-600 dark:text-gray-400">pm_...</span></span>
              <span>2. <span className="text-gray-600 dark:text-gray-400">pm_...</span> + challenge → <span className="text-gray-600 dark:text-gray-400">spt_...</span> via <span className="text-gray-700 dark:text-gray-300">/api/stripe/mpp-spt</span></span>
              <span>3. Retry with <span className="text-gray-600 dark:text-gray-400">Authorization: Bearer spt_...</span></span>
              <span>4. Server creates PaymentIntent → card charged</span>
            </div>
            <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-2.5">
              mppx CLI is crypto-only. This path requires{" "}
              <span className="font-mono">mppx/client</span> in a browser or SDK app.
              Once the Stripe Profile is approved, this demo generates live{" "}
              <span className="font-mono">spt_...</span> tokens to illustrate step 2.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Machine Payments · Card · SPT</p>
            <span className="ml-8 shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Pending
            </span>
          </div>
        </>
      ) : (
        /* Active state — profile is configured */
        <>
          {state.status === "success" ? (
            <div className="flex flex-col gap-2 mb-5">
              <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                  1 · Client — token generated · test card
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">{state.token}</p>
              </div>

              <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                  2 · Use with mppx
                </p>
                <code className="text-xs text-gray-700 dark:text-gray-300 break-all">{state.example_cli}</code>
              </div>

              <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                  3 · Usage limits
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  max {(state.usage_limits.max_amount / 100).toFixed(2)}{" "}
                  {state.usage_limits.currency.toUpperCase()} · expires{" "}
                  {new Date(state.usage_limits.expires_at * 1000).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  {
                    label: "Client / Agent",
                    description: "Holds a card. mppx/client exchanges it for a short-lived spt_... token before each paid request.",
                  },
                  {
                    label: "Stripe",
                    description: "Validates the token and charges the card when the merchant creates a PaymentIntent.",
                  },
                  {
                    label: "Merchant",
                    description: "Receives Authorization: Bearer spt_... on the request, creates a PaymentIntent server-side.",
                  },
                ].map(({ label, description }) => (
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
                In this demo, clicking Generate simulates what mppx/client does on the client side.
              </p>
            </>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Machine Payments · Card · SPT</p>
            {state.status === "success" ? (
              <button
                onClick={generate}
                className="ml-8 shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:border-black/20 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-gray-300"
              >
                New token
              </button>
            ) : (
              <button
                onClick={generate}
                disabled={state.status === "loading"}
                className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state.status === "loading" ? "Generating…" : "Generate demo token →"}
              </button>
            )}
          </div>

          {state.status === "error" && (
            <p className="mt-3 text-xs text-red-500 dark:text-red-400">{state.message}</p>
          )}
        </>
      )}
    </div>
  );
}
