import { Header } from "@/components/Header";
import Link from "next/link";

const demos: { title: string; description: string; status: "coming-soon" }[] =
  [
    {
      title: "Stripe Checkout",
      description: "One-time payment flow using Stripe Checkout.",
      status: "coming-soon",
    },
    {
      title: "Stripe Subscriptions",
      description: "Recurring billing with plan selection.",
      status: "coming-soon",
    },
    {
      title: "Tempo MPP",
      description: "Pay-per-use API access via Tempo MPP.",
      status: "coming-soon",
    },
  ];

export default function PaymentDemos() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />

      <main className="flex flex-1 flex-col px-8 py-24 mx-auto w-full max-w-5xl">
        {/* Back link */}
        <Link
          href="/"
          className="group mb-16 flex items-center gap-2 text-xs text-gray-500 transition-colors duration-200 hover:text-white w-fit"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          Home
        </Link>

        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
            Payment Demos
          </h1>
          <p className="mb-16 text-gray-400 leading-relaxed">
            Experiments with Stripe and Tempo MPP. This is a sandbox — things
            will break and change.
          </p>

          <div className="flex flex-col gap-4">
            {demos.map((demo) => (
              <div
                key={demo.title}
                className="flex items-start justify-between rounded-lg border border-white/[0.08] px-6 py-5"
              >
                <div>
                  <p className="mb-1 text-sm font-medium text-white">
                    {demo.title}
                  </p>
                  <p className="text-xs text-gray-500">{demo.description}</p>
                </div>
                <span className="ml-8 mt-0.5 shrink-0 rounded-full border border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-widest text-gray-600">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-8 py-6 flex items-center justify-between">
          <span className="text-xs text-gray-600">
            © {new Date().getFullYear()} Matthew Slater
          </span>
          <span className="text-xs text-gray-600">matthewslater.xyz</span>
        </div>
      </footer>
    </div>
  );
}
