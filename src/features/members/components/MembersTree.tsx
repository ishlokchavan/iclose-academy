"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";

import type { MemberRow } from "../server/queries";

type TreeNodeData = MemberRow & { _children: TreeNodeData[]; _depth: number };

function buildForest(members: MemberRow[]): TreeNodeData[] {
  const all: TreeNodeData[] = members.map((m) => ({ ...m, _children: [], _depth: 0 }));
  const byCode = new Map<string, TreeNodeData>();
  for (const n of all) {
    if (n.referral_code) byCode.set(n.referral_code, n);
  }

  const roots: TreeNodeData[] = [];
  for (const n of all) {
    const parent = n.referred_by_code ? byCode.get(n.referred_by_code) : undefined;
    if (parent) parent._children.push(n);
    else roots.push(n);
  }

  function setDepth(node: TreeNodeData, d: number) {
    node._depth = d;
    for (const c of node._children) setDepth(c, d + 1);
  }
  for (const r of roots) setDepth(r, 0);

  function size(n: TreeNodeData): number {
    return 1 + n._children.reduce((s, c) => s + size(c), 0);
  }
  function sortTree(n: TreeNodeData) {
    n._children.sort((a, b) => size(b) - size(a));
    for (const c of n._children) sortTree(c);
  }
  roots.sort((a, b) => size(b) - size(a));
  for (const r of roots) sortTree(r);

  return roots;
}

function initials(name: string | null, email: string) {
  const src = (name ?? email).trim();
  if (!src) return "??";
  return src
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const INTENT_TONE: Record<string, string> = {
  closer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
};

export function MembersTree({
  members,
  onSelect,
  selectedId,
}: {
  members: MemberRow[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const roots = useMemo(() => buildForest(members), [members]);

  if (roots.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-raised py-16 text-center text-[13px] text-ink-muted">
        No members yet.
      </div>
    );
  }

  // Split: trees with actual branches vs. solo roots (no referrals).
  // Solo roots get a compact chip grid below — saves a screenful of empty
  // boxes once the platform has 100+ members.
  const networks  = roots.filter((r) => r._children.length > 0);
  const solos     = roots.filter((r) => r._children.length === 0);

  return (
    <div className="space-y-10">
      {networks.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Referral networks</p>
            <p className="text-[11px] text-ink-muted">
              {networks.length} {networks.length === 1 ? "network" : "networks"}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface-raised p-8 shadow-card">
            <div className="flex min-w-max flex-col items-stretch gap-12">
              {networks.map((root, i) => (
                <div key={root.id} className="flex flex-col items-center">
                  {i > 0 ? (
                    <div className="mb-12 h-px w-full max-w-[280px] bg-hairline/60" aria-hidden />
                  ) : null}
                  <TreeNode node={root} onSelect={onSelect} selectedId={selectedId} isRoot />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {solos.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Independent members</p>
            <p className="text-[11px] text-ink-muted">
              {solos.length} with no referral activity
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {solos.map((s) => (
              <SoloChip key={s.id} node={s} onSelect={onSelect} selectedId={selectedId} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Canonical CSS org-chart connectors — pure pseudo-elements, no SVG.
          The pattern: each child has a vertical "stub" up to a horizontal
          bar that connects siblings; the bar is implemented as a top
          border on each child whose left/right edges are trimmed for the
          first/last child. */}
      <style>{`
        .tree-node {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tree-children {
          display: flex;
          align-items: flex-start;
          gap: 28px;
          padding-top: 18px;
          position: relative;
        }
        /* Vertical drop from the parent down to the horizontal bar */
        .tree-children::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 18px;
          background: rgb(0 0 0 / 0.10);
        }
        .tree-child {
          position: relative;
          padding-top: 18px;
        }
        /* Vertical stub from the bar up to each child card */
        .tree-child::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 18px;
          background: rgb(0 0 0 / 0.10);
        }
        /* Horizontal bar connecting siblings — drawn as a top border */
        .tree-child::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgb(0 0 0 / 0.10);
        }
        .tree-child:first-child::after { left: 50%; }
        .tree-child:last-child::after  { right: 50%; }
        .tree-child:only-child::after  { display: none; }
      `}</style>
    </div>
  );
}

function TreeNode({
  node, onSelect, selectedId, isRoot,
}: {
  node: TreeNodeData;
  onSelect: (id: string) => void;
  selectedId: string | null;
  isRoot?: boolean;
}) {
  return (
    <div className={cn("tree-node", !isRoot && "tree-child")}>
      <NodeCard node={node} onSelect={onSelect} selectedId={selectedId} isRoot={isRoot} />
      {node._children.length > 0 ? (
        <div className="tree-children">
          {node._children.map((c) => (
            <TreeNode key={c.id} node={c} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NodeCard({
  node, onSelect, selectedId, isRoot,
}: {
  node: TreeNodeData;
  onSelect: (id: string) => void;
  selectedId: string | null;
  isRoot?: boolean;
}) {
  const childCount = node._children.length;
  const selected = node.id === selectedId;
  const displayName = node.name?.trim() || node.email.split("@")[0] || node.email;

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={cn(
        "group relative inline-flex w-[240px] shrink-0 items-center gap-2.5 rounded-xl border bg-surface px-3 py-2.5 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-card-hover",
        selected && "border-accent shadow-card-hover ring-1 ring-accent/30",
        !selected && isRoot && "border-ink/20 shadow-card",
        !selected && !isRoot && "border-hairline",
      )}
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
        {initials(node.name, node.email)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-semibold text-ink">{displayName}</p>
          {node.is_verified ? (
            <Check className="size-3 shrink-0 text-emerald-600" aria-label="Verified" />
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {node.referral_code ? (
            <code className="rounded border border-hairline bg-surface-subtle px-1 font-mono text-[10px] text-ink-muted">
              {node.referral_code}
            </code>
          ) : null}
          {node.intent ? (
            <span
              className={cn(
                "rounded-full border px-1.5 text-[9.5px] font-medium capitalize leading-[1.4]",
                INTENT_TONE[node.intent] ?? "border-hairline bg-surface-subtle text-ink-muted",
              )}
            >
              {node.intent}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="rounded-full bg-ink/5 px-1.5 text-[9.5px] font-medium uppercase tracking-wider text-ink-muted">
          {isRoot ? "Root" : `T${node._depth}`}
        </span>
        {childCount > 0 ? (
          <span className="rounded-full bg-accent/10 px-1.5 text-[10px] font-semibold tabular-nums text-accent">
            +{childCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function SoloChip({
  node, onSelect, selectedId,
}: {
  node: TreeNodeData;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const selected = node.id === selectedId;
  const displayName = node.name?.trim() || node.email.split("@")[0] || node.email;
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl border bg-surface-raised px-3 py-2 text-left transition-colors",
        "hover:border-ink/25",
        selected ? "border-accent ring-1 ring-accent/30" : "border-hairline",
      )}
    >
      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[11px] font-semibold text-ink">
        {initials(node.name, node.email)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-ink">{displayName}</p>
          {node.is_verified ? (
            <Check className="size-3 shrink-0 text-emerald-600" aria-label="Verified" />
          ) : null}
        </div>
        <p className="truncate text-[11px] text-ink-muted">{node.email}</p>
      </div>
      {node.referral_code ? (
        <code className="shrink-0 rounded border border-hairline bg-surface-subtle px-1 font-mono text-[10px] text-ink-muted">
          {node.referral_code}
        </code>
      ) : null}
      {node.intent ? (
        <span
          className={cn(
            "shrink-0 rounded-full border px-1.5 text-[9.5px] font-medium capitalize",
            INTENT_TONE[node.intent] ?? "border-hairline bg-surface-subtle text-ink-muted",
          )}
        >
          {node.intent}
        </span>
      ) : null}
    </button>
  );
}
