import { Header } from "@/components/Header";
import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";
import { MppDemo } from "@/components/MppDemo";
import { StripeCryptoDemo } from "@/components/StripeCryptoDemo";
import { StripeSptDemo } from "@/components/StripeSptDemo";

export default function PaymentDemos() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />

      <main className="flex flex-1 flex-col px-8 py-24 mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="group mb-16 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:text-gray-900 dark:hover:text-white w-fit"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          Home
        </Link>

        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white [text-wrap:balance]">
            Payment Demos
          </h1>
          <p className="mb-16 text-gray-500 dark:text-gray-400 leading-relaxed">
            Experiments with Stripe and Tempo MPP. This is a sandbox — things
            will break and change.
          </p>

          <div className="flex flex-col gap-4">
            {/* Stripe Checkout — live */}
            <div className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-5 mb-5 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="shrink-0 w-12 h-12 rounded border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Widget</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">SKU-0042</p>
                </div>
                <p className="ml-auto text-sm text-gray-900 dark:text-white">1.00 usd</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">One-time payment · Stripe Checkout</p>
                <CheckoutButton />
              </div>
            </div>

            {/* MPP — live */}
            <MppDemo />

            {/* Stripe Machine Payments · Crypto — live */}
            <StripeCryptoDemo />

            {/* Stripe Machine Payments · Card (SPT) — pending profile activation */}
            <StripeSptDemo />

          </div>
        </div>
      </main>

      <footer className="border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-8 py-6 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Matthew Slater
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-600">matthewslater.xyz</span>
        </div>
      </footer>
    </div>
  );
}
