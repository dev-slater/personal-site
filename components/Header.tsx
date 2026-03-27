import Link from "next/link";

type HeaderProps = {
  showPaymentDemos?: boolean;
};

export function Header({ showPaymentDemos = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-5">
        {/* MS Monogram */}
        <Link href="/" className="group flex items-center">
          <span className="text-sm font-bold tracking-[0.2em] text-white transition-opacity duration-200 group-hover:opacity-70">
            MS
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {showPaymentDemos && (
            <Link
              href="/payment-demos"
              className="text-xs text-gray-500 transition-colors duration-200 hover:text-white"
            >
              Payment Demos
            </Link>
          )}
          <Link
            href="/#contact"
            className="text-xs text-gray-500 transition-colors duration-200 hover:text-white"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
