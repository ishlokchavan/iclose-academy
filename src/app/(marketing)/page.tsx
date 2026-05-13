import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="max-w-3xl space-y-8">
          <p className="eyebrow">Real estate · Micro-market expertise</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tighter text-ink">
            Specialist intelligence
            <br />
            <span className="text-ink-muted">for operators who close.</span>
          </h1>
          <p className="max-w-xl text-lg text-ink-muted">
            Structured learning from community, building, luxury, off-plan, and leasing
            specialists. No noise. No fluff. Just elite, applied knowledge.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Get started <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/sign-in">I have an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
