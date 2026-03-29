import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matthew Slater",
  description: "GTM at Tempo",
  metadataBase: new URL("https://matthewslater.xyz"),
  openGraph: {
    title: "Matthew Slater",
    description: "GTM at Tempo",
    url: "https://matthewslater.xyz",
    siteName: "Matthew Slater",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Matthew Slater",
    description: "GTM at Tempo",
    creator: "@slaterm100",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
