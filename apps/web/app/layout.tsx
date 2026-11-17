import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/session";
import { themeScript } from "@/components/theme";

export const metadata: Metadata = {
  title: { default: "MOVA — Move smart. Travel easy.", template: "%s · MOVA" },
  description: "Find a trip, pick your seat, pay with mobile money or card, and board with a QR ticket. Student travel for UCC.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#493BFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e22" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-50 rounded-lg bg-electric px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
