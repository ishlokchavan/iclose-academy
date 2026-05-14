import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <section className="relative min-h-dvh">
      {/* Subtle Apple-style gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(211_100%_95%/0.6),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36 lg:py-44">
        <div className="max-w-3xl space-y-7">
          <p className="eyebrow">Real estate · Micro-market expertise</p>

          {/* Hero headline — Apple uses very bold, tight, large type */}
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-tighter text-ink">
            Specialist intelligence
            <br />
            <span className="text-ink-muted font-semibold">for operators who close.</span>
          </h1>

          <p className="max-w-xl text-[17px] leading-relaxed text-ink-muted">
            Structured learning from community, building, luxury, off-plan, and leasing
            specialists. No noise. No fluff. Just elite, applied knowledge.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Get started <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
