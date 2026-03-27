import { Header } from "@/components/Header";
import { SocialLinks } from "@/components/SocialLinks";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />

      {/* Hero */}
      <main className="flex flex-1 flex-col items-start justify-center px-8 py-32 mx-auto w-full max-w-5xl">
        <div className="max-w-2xl">
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
          <div id="contact">
            <SocialLinks />
          </div>
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
