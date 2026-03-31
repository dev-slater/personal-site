"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeCardElement } from "@stripe/stripe-js";

const profileId = process.env.NEXT_PUBLIC_STRIPE_PROFILE_ID;
const sptEnabled = true;
const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_");

const UNIT_PRICE = 0.05;
const MIN_QUANTITY = 10; // 10 × $0.05 = $0.50 — Stripe SPT minimum charge
const MAX_QUANTITY = 20; // 20 × $0.05 = $1.00

let stripePromise: ReturnType<typeof loadStripe> | null = null;
function getStripe() {
  if (!stripePromise)
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
}

/** base64url-encode a UTF-8 string (matches mppx Credential.serialize) */
function toBase64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      token: string;
      usage_limits: { currency: string; max_amount: number; expires_at: number };
    }
  | { status: "paying" }
  | { status: "paid"; quantity: number; total: string; receipt?: { method: string; status: string; timestamp: string; reference: string } }
  | { status: "error"; message: string };

export function StripeSptDemo() {
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [state, setState] = useState<State>({ status: "idle" });
  const [cardComplete, setCardComplete] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const cardElementRef = useRef<StripeCardElement | null>(null);

  const total = (quantity * UNIT_PRICE).toFixed(2);
  const showForm = state.status === "idle" || state.status === "loading";

  // Mount Stripe card element when showing the form
  useEffect(() => {
    if (!showForm) return;
    let active = true;
    let cardEl: StripeCardElement | null = null;

    async function mount() {
      const stripe = await getStripe();
      if (!stripe || !active || !cardContainerRef.current) return;
      stripeRef.current = stripe;

      const dark = document.documentElement.classList.contains("dark");
      const elements = stripe.elements();
      cardEl = elements.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: "12px",
            fontFamily: "monospace",
            color: dark ? "#d1d5db" : "#111827",
            "::placeholder": { color: dark ? "#4b5563" : "#9ca3af" },
          },
          invalid: { color: "#ef4444" },
        },
      });
      cardEl.mount(cardContainerRef.current!);
      cardEl.on("change", (e) => { if (active) setCardComplete(e.complete); });
      cardElementRef.current = cardEl;
    }

    mount();

    return () => {
      active = false;
      cardEl?.destroy();
      cardElementRef.current = null;
      setCardComplete(false);
    };
  }, [mountKey]);

  async function generate() {
    if (!stripeRef.current || !cardElementRef.current) return;

    const { paymentMethod, error } = await stripeRef.current.createPaymentMethod({
      type: "card",
      card: cardElementRef.current,
    });

    if (error || !paymentMethod) {
      setState({ status: "error", message: error?.message ?? "Failed to read card" });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/stripe/mpp-spt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, paymentMethod: paymentMethod.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate token");
      setState({ status: "success", token: data.token, usage_limits: data.usage_limits });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async function completePayment() {
    if (state.status !== "success") return;
    const token = state.token;
    setState({ status: "paying" });

    try {
      const challengeRes = await fetch(`/api/mpp/widgets?quantity=${quantity}`);
      if (challengeRes.status !== 402) throw new Error("Expected 402 from endpoint");

      const wwwAuth = challengeRes.headers.get("www-authenticate") ?? "";
      const parts = wwwAuth.split(/(?=Payment\s+id=)/).filter(Boolean);
      const sc = parts.find((p) => p.includes('method="stripe"'));
      if (!sc) throw new Error("No Stripe challenge in 402 response");

      const get = (key: string) => sc.match(new RegExp(`${key}="([^"]+)"`))?.[1];
      const challenge = {
        id: get("id"), realm: get("realm"), method: "stripe",
        intent: get("intent"), request: get("request"),
        description: get("description"), expires: get("expires"),
      };

      const encoded = toBase64url(JSON.stringify({ challenge, payload: { spt: token } }));
      const payRes = await fetch(`/api/mpp/widgets?quantity=${quantity}`, {
        headers: { Authorization: `Payment ${encoded}` },
      });

      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.detail ?? `Payment failed (${payRes.status})`);
      }

      const receiptHeader = payRes.headers.get("payment-receipt");
      let receipt: { method: string; status: string; timestamp: string; reference: string } | undefined;
      if (receiptHeader) {
        try { receipt = JSON.parse(atob(receiptHeader)); } catch { /* ignore */ }
      }

      const data = await payRes.json();
      setState({ status: "paid", quantity: data.quantity, total: data.total_charged, receipt });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Payment failed" });
    }
  }

  function reset() {
    setState({ status: "idle" });
    setMountKey((k) => k + 1);
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
          <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe Machine Payments · Card</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">0.05 usd / token · card · Shared Payment Token (SPT)</p>
        </div>
      </div>

      {/* Pending activation state */}
      {!profileId || !sptEnabled ? (
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
              <span>3. Retry with <span className="text-gray-600 dark:text-gray-400">Authorization: Payment ...</span></span>
              <span>4. Server creates PaymentIntent → card charged</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Machine Payments · Card · SPT</p>
            <span className="ml-8 shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Pending Stripe activation
            </span>
          </div>
        </>
      ) : (
        <>
          {/* ── Form: card input + generate ── */}
          {showForm && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Client / Agent", description: "Enters a card. mppx/client exchanges it for a short-lived spt_... token before each paid request." },
                  { label: "Stripe", description: "Validates the token and charges the card when the merchant creates a PaymentIntent." },
                  { label: "Merchant", description: "Receives the mppx credential, creates a PaymentIntent server-side using the SPT." },
                ].map(({ label, description }) => (
                  <div key={label} className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1.5">{label}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 mb-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2.5">Card</p>
                <div ref={cardContainerRef} className="py-0.5" />
                {isTestMode && (
                  <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-2.5">
                    Test card: 4242 4242 4242 4242 · any future date · any CVC
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
                      disabled={quantity <= MIN_QUANTITY || state.status === "loading"}
                      className="w-6 h-6 rounded border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    >−</button>
                    <span className="text-sm text-gray-900 dark:text-white w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                      disabled={quantity >= MAX_QUANTITY || state.status === "loading"}
                      className="w-6 h-6 rounded border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    >+</button>
                  </div>
                </div>
                <span className="text-sm text-gray-900 dark:text-white">{total} usd</span>
              </div>
              <p className="text-[10px] text-gray-300 dark:text-gray-700 mb-5">
                Stripe SPT minimum: 0.50 usd · adjust widget pricing to unlock a wider range.
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Machine Payments · Card · SPT</p>
                <button
                  onClick={generate}
                  disabled={!cardComplete || state.status === "loading"}
                  className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {state.status === "loading" ? "Generating…" : "Generate token →"}
                </button>
              </div>
            </>
          )}

          {/* ── Token generated, ready to pay ── */}
          {state.status === "success" && (
            <>
              <div className="flex flex-col gap-2 mb-5">
                <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                    1 · SPT generated · {total} usd
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">{state.token}</p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-1.5">
                    Your card was exchanged for this short-lived token. In production, mppx/client does this transparently before each request.
                  </p>
                </div>
                <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Usage limits</p>
                  <p className="text-xs text-gray-500 font-mono">
                    max {(state.usage_limits.max_amount / 100).toFixed(2)}{" "}
                    {state.usage_limits.currency.toUpperCase()} · expires{" "}
                    {new Date(state.usage_limits.expires_at * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Machine Payments · Card · SPT</p>
                <button
                  onClick={completePayment}
                  className="ml-8 shrink-0 rounded-full border border-black/20 dark:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-900 dark:text-white transition-colors duration-200 hover:border-black/40 dark:hover:border-white/40"
                >
                  Complete payment →
                </button>
              </div>
            </>
          )}

          {/* ── Paying ── */}
          {state.status === "paying" && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Completing payment…
              </p>
            </div>
          )}

          {/* ── Paid ── */}
          {state.status === "paid" && (
            <>
              <div className="flex flex-col gap-2 mb-5">
                <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Payment confirmed</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{state.quantity}× widget · {state.total}</p>
                </div>
                {state.receipt && (
                  <div className="rounded border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">Payment receipt</p>
                    <div className="flex flex-col gap-1 text-xs font-mono">
                      <div className="flex gap-3">
                        <span className="text-gray-400 dark:text-gray-600 w-20 shrink-0">method</span>
                        <span className="text-gray-600 dark:text-gray-400">stripe / card</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-gray-400 dark:text-gray-600 w-20 shrink-0">reference</span>
                        <a
                          href={`https://dashboard.stripe.com/payments/${state.receipt.reference}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 dark:text-gray-300 hover:underline truncate"
                        >
                          {state.receipt.reference.slice(0, 24)}… ↗
                        </a>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-gray-400 dark:text-gray-600 w-20 shrink-0">timestamp</span>
                        <span className="text-gray-500">{state.receipt.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-2.5">
                      Stripe also fired a <span className="font-mono">payment_intent.succeeded</span> webhook in the background.
                    </p>
                  </div>
                )}
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

          {/* Error */}
          {state.status === "error" && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-red-500 dark:text-red-400">{state.message}</p>
              <button
                onClick={reset}
                className="ml-8 shrink-0 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
