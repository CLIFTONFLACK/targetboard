import type { Metadata } from "next";
import "./globals.css";
import { OpenBetaBanner } from "@/components/OpenBetaBanner";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "TargetBoard Content Manager",
  description: "Human-supervised content ops for TargetBoard.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-tb-paper text-tb-ink">
        <QueryProvider>
          <OpenBetaBanner />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
