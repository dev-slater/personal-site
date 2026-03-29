import { Header } from "@/components/Header";
import Link from "next/link";

export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />

      <main className="flex flex-1 flex-col px-8 py-24 mx-auto w-full max-w-5xl">
        <Link
          href="/payment-demos"
          className="group mb-16 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200 hover:text-gray-900 dark:hover:text-white w-fit"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          Payment Demos
        </Link>

        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Payment successful
          </h1>
          <p className="mb-8 text-gray-500 dark:text-gray-400 leading-relaxed">
            Thanks for buying a Widget.
          </p>

          {session_id && (
            <p className="text-xs text-gray-400 dark:text-gray-600 font-mono break-all">
              session: {session_id}
            </p>
          )}
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
