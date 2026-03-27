import { SocialLinks } from "@/components/SocialLinks";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-5">
          <span className="text-sm font-medium text-white tracking-wide">
            Matthew Slater
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/matthew-slater/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 transition-colors duration-200 hover:text-white"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/slaterm100"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 transition-colors duration-200 hover:text-white"
            >
              X
            </a>
            <a
              href="mailto:matthew@tempo.xyz"
              className="text-xs text-gray-500 transition-colors duration-200 hover:text-white"
            >
              Email
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-start justify-center px-8 py-32 mx-auto w-full max-w-5xl">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            matthewslater.xyz
          </p>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white [text-wrap:balance] sm:text-6xl">
            Matthew Slater
          </h1>
          <p className="mb-12 text-lg text-gray-400 leading-relaxed">
            GTM at{" "}
            <a
              href="https://tempo.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-opacity duration-200 hover:opacity-70"
            >
              Tempo
            </a>
            .
          </p>
          <SocialLinks />
        </div>
      </main>

      {/* Footer */}
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
