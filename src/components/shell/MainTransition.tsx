"use client";

import { usePathname } from "next/navigation";

export function MainTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in motion-reduce:animate-none">
      {children}
    </div>
  );
}
