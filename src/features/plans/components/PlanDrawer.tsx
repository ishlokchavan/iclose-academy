"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { updatePlanAction, type UpdatePlanInput } from "../server/actions";
import type { PlanWithCounts } from "../server/queries";

type Billing = "free" | "monthly" | "yearly";

export function PlanDrawer({
  plan, onClose,
}: {
  plan: PlanWithCounts | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={plan !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent title="Edit plan" description="Update label, pricing, and features">
        {plan ? <Body plan={plan} onClose={onClose} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Body({ plan, onClose }: { plan: PlanWithCounts; onClose: () => void }) {
  const [label, setLabel]       = useState(plan.label);
  const [tagline, setTagline]   = useState(plan.tagline ?? "");
  const [billing, setBilling]   = useState<Billing>((plan.billing_cycle as Billing) ?? "yearly");
  const [monthly, setMonthly]   = useState(plan.price_monthly_aed != null ? String(plan.price_monthly_aed) : "");
  const [yearly, setYearly]     = useState(plan.price_yearly_aed != null ? String(plan.price_yearly_aed) : "");
  const [split, setSplit]       = useState(String(plan.agent_split_pct));
  const [isStar, setIsStar]     = useState(plan.is_star);
  const [isActive, setIsActive] = useState(plan.is_active);
  const [order, setOrder]       = useState(String(plan.order));
  const [features, setFeatures] = useState<string[]>(
    Array.isArray(plan.features_json)
      ? (plan.features_json as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
  );

  const [error, setError]   = useState<string | null>(null);
  const [pending, start]    = useTransition();

  // Reset when a different plan is selected.
  useEffect(() => {
    setLabel(plan.label);
    setTagline(plan.tagline ?? "");
    setBilling((plan.billing_cycle as Billing) ?? "yearly");
    setMonthly(plan.price_monthly_aed != null ? String(plan.price_monthly_aed) : "");
    setYearly(plan.price_yearly_aed != null ? String(plan.price_yearly_aed) : "");
    setSplit(String(plan.agent_split_pct));
    setIsStar(plan.is_star);
    setIsActive(plan.is_active);
    setOrder(String(plan.order));
    setFeatures(
      Array.isArray(plan.features_json)
        ? (plan.features_json as unknown[]).filter((x): x is string => typeof x === "string")
        : [],
    );
    setError(null);
  }, [plan]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const monthlyNum = monthly.trim() === "" ? null : Number(monthly);
    const yearlyNum  = yearly.trim() === ""  ? null : Number(yearly);
    if (monthlyNum !== null && Number.isNaN(monthlyNum)) {
      setError("Monthly price must be a number.");
      return;
    }
    if (yearlyNum !== null && Number.isNaN(yearlyNum)) {
      setError("Yearly price must be a number.");
      return;
    }
    const splitNum = Number(split);
    const orderNum = Number(order);
    if (Number.isNaN(splitNum) || splitNum < 0 || splitNum > 100) {
      setError("Agent split must be 0–100.");
      return;
    }
    if (Number.isNaN(orderNum)) {
      setError("Order must be a number.");
      return;
    }

    const payload: UpdatePlanInput = {
      label: label.trim(),
      tagline: tagline.trim() === "" ? null : tagline.trim(),
      billing_cycle: billing,
      price_monthly_aed: monthlyNum,
      price_yearly_aed: yearlyNum,
      agent_split_pct: splitNum,
      is_star: isStar,
      is_active: isActive,
      features: features.map((f) => f.trim()).filter(Boolean),
      order: orderNum,
    };

    start(async () => {
      const res = await updatePlanAction(plan.key, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-hairline px-6 pb-6 pt-8">
        <p className="eyebrow">Plan</p>
        <h2 className="mt-1.5 text-[22px] font-bold tracking-tight text-ink">{plan.label}</h2>
        <p className="mt-1 font-mono text-[11px] text-ink-muted">{plan.key}</p>
        <p className="mt-2 text-[12px] text-ink-muted">
          {plan.profiles_count} active users · {plan.leads_count} leads
        </p>
      </div>

      <div className="space-y-5 px-6 py-5">
        <Field label="Display label">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={80} />
        </Field>

        <Field label="Tagline" hint="Shown under the label on the pricing page">
          <textarea
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            rows={2}
            maxLength={400}
            className="w-full rounded-md border border-hairline bg-surface-raised px-3 py-2 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Billing cycle">
          <select
            value={billing}
            onChange={(e) => setBilling(e.target.value as Billing)}
            className="h-9 w-full rounded-md border border-hairline bg-surface-raised px-3 text-[14px] text-ink focus:outline-none focus:border-accent"
          >
            <option value="free">Free</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly price (AED)">
            <Input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              placeholder="—"
              disabled={billing === "free"}
              min={0}
            />
          </Field>
          <Field label="Yearly price (AED)">
            <Input
              type="number"
              value={yearly}
              onChange={(e) => setYearly(e.target.value)}
              placeholder="—"
              disabled={billing === "free"}
              min={0}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Agent split %" hint="Share kept by the agent on inquiries">
            <Input
              type="number"
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              min={0}
              max={100}
            />
          </Field>
          <Field label="Order" hint="Lower numbers appear first">
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min={0}
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-lg border border-hairline bg-surface-subtle/40 p-3">
          <Toggle
            label="Star plan"
            description="Highlights as recommended on the pricing page."
            checked={isStar}
            onChange={setIsStar}
          />
          <Toggle
            label="Active"
            description="Inactive plans stay in the DB for reversibility but disappear from the pricing page and signup."
            checked={isActive}
            onChange={setIsActive}
          />
        </div>

        <Field
          label="Features"
          hint="One feature per row. Shown as bullets on the pricing card."
        >
          <FeatureEditor features={features} onChange={setFeatures} />
        </Field>

        {error ? (
          <p className="text-[13px] text-destructive" role="alert">{error}</p>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-hairline bg-surface-raised px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-[11px] text-ink-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked
            ? "bg-accent border-accent"
            : "bg-surface border-hairline"
        }`}
      >
        <span
          className={`absolute top-0.5 inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function FeatureEditor({
  features, onChange,
}: {
  features: string[];
  onChange: (next: string[]) => void;
}) {
  function update(idx: number, value: string) {
    onChange(features.map((f, i) => (i === idx ? value : f)));
  }
  function remove(idx: number) {
    onChange(features.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...features, ""]);
  }

  return (
    <div className="space-y-2">
      {features.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-3 py-3 text-center text-[12px] text-ink-muted">
          No features yet.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input
                value={f}
                onChange={(e) => update(i, e.target.value)}
                placeholder="e.g. Unlimited inquiries"
                className="flex-1"
                maxLength={200}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-9 place-items-center rounded-md border border-hairline text-ink-muted hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                aria-label="Remove feature"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="secondary" size="sm" onClick={add} className="w-full">
        <Plus className="size-3.5" /> Add feature
      </Button>
    </div>
  );
}
