import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AttributionInit } from "@/components/attribution-init";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prompts.itsdad.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Prompt Generator — Top 5 AI Prompts for Any Topic | ItsDad",
    template: "%s | AI Prompt Generator",
  },
  description:
    "Turn any topic, sentence, or set of keywords into the top 5 ready-to-use AI chatbot prompts. Free tool by ItsDad — pick a tone, generate, and copy instantly.",
  keywords: [
    "AI prompt generator",
    "chatgpt prompts",
    "claude prompts",
    "prompt engineering tool",
    "AI prompt ideas",
  ],
  authors: [{ name: "ItsDad", url: "https://itsdad.io" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AI Prompt Generator by ItsDad",
    title: "AI Prompt Generator — Top 5 AI Prompts for Any Topic",
    description:
      "Turn any topic into the top 5 ready-to-use AI chatbot prompts. Pick a tone, generate, and copy instantly.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AI Prompt Generator by ItsDad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Generator — Top 5 AI Prompts for Any Topic",
    description:
      "Turn any topic into the top 5 ready-to-use AI chatbot prompts. Pick a tone, generate, and copy instantly.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AttributionInit />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
