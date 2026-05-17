import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Architecture Constructor",
  description: "Design a web architecture from requirements.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 mb-6">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">
              Arch Constructor
            </Link>
            <nav className="text-sm">
              <Link href="/new" className="text-blue-600 hover:underline">
                New design
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 pb-12">{children}</main>
      </body>
    </html>
  );
}
