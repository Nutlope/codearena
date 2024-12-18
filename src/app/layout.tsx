import Logo from "@/components/logo";
import type { Metadata } from "next";
import { Tektur, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GithubIcon from "@/components/icons/github";
import XIcon from "@/components/icons/x";
import RibbonIcon from "@/components/icons/ribbon";
import DotsBackground from "@/public/dots-background.png";
import PlausibleProvider from "next-plausible";

const tektur = Tektur({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-tektur",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

const title = "CodeArena – Which LLM codes best?";
const description =
  "Watch AI models compete in real-time & vote on the best one";
const url = "https://llmcodearena.com/";
const ogimage = "https://llmcodearena.com/og-image.png";
const sitename = "llmcodearena.com";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${tektur.variable} ${plusJakartaSans.variable} h-full`}
    >
      <head>
        <PlausibleProvider domain="llmcodearena.com" />
      </head>
      <body className="relative flex min-h-full flex-col bg-gray-300 text-gray-500 antialiased">
        <div
          style={{
            backgroundImage: `url(${DotsBackground.src})`,
          }}
          className="absolute inset-x-0 -z-10 flex h-[456px] items-center justify-center bg-contain bg-center"
        ></div>

        <header className="px-4 py-2 md:py-5">
          <div className="mx-auto flex max-w-screen-2xl justify-between">
            <Link href="/">
              <Logo />
            </Link>

            <Button
              asChild
              className="size-8 font-title font-bold md:size-auto"
            >
              <Link href="/top-models">
                <RibbonIcon />
                <span className="hidden md:inline">Leaderboard</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex grow flex-col px-4 py-8">{children}</main>

        <footer className="mt-16 px-2 py-2 md:px-4 md:py-8">
          <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
            <p className="text-xs md:text-sm">
              Powered by{" "}
              <a
                href="https://dub.sh/together-ai"
                target="_blank"
                className="font-medium underline underline-offset-4"
              >
                Together.ai
              </a>
            </p>
            <div className="inline-flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-md border border-gray-500 px-3 text-xs"
                asChild
              >
                <a
                  href="https://github.com/Nutlope/codearena"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon />
                  GitHub
                </a>
              </Button>
              <Button
                variant="ghost"
                className="rounded-md border border-gray-500 px-3 text-xs"
                asChild
              >
                <a
                  href="https://x.com/nutlope"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XIcon />
                  Twitter
                </a>
              </Button>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
