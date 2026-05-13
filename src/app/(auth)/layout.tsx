import Link from "next/link";

import { Brand } from "@/components/shell/Brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-4 py-6 sm:px-6">
        <Brand href="/" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-ink-muted sm:px-6">
        <Link href="/" className="hover:text-ink">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
