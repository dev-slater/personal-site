import type { Metadata } from "next";
import { Geist } from "next/font/google";
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
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
