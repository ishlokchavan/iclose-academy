"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";

import type { MemberRow } from "../server/queries";

type TreeNodeData = MemberRow & { _children: TreeNodeData[]; _depth: number };

function buildForest(members: MemberRow[]): TreeNodeData[] {
  const byCode = new Map<string, TreeNodeData>();
  const all: TreeNodeData[] = members.map((m) => ({ ...m, _children: [], _depth: 0 }));
  for (const n of all) {
    if (n.referral_code) byCode.set(n.referral_code, n);
  }

  const roots: TreeNodeData[] = [];
  for (const n of all) {
    const parent = n.referred_by_code ? byCode.get(n.referred_by_code) : undefined;
    if (parent) {
      n._depth = parent._depth + 1;
      parent._children.push(n);
    } else {
      roots.push(n);
    }
  }

  // Recompute depth in case parents were processed after children (insertion order)
  function setDepth(node: TreeNodeData, d: number) {
    node._depth = d;
    for (const c of node._children) setDepth(c, d + 1);
  }
  for (const r of roots) setDepth(r, 0);

  // Sort: roots with most descendants first; within a parent, biggest subtree first.
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

  return (
    <div className="space-y-8">
      {roots.map((root) => (
        <div
          key={root.id}
          className="overflow-x-auto rounded-2xl border border-hairline bg-surface-raised p-6 shadow-card"
        >
          <ul className="org-chart">
            <NodeView node={root} onSelect={onSelect} selectedId={selectedId} isRoot />
          </ul>
        </div>
      ))}

      {/* CSS for the org-chart connectors — scoped via class names so it
          doesn't leak; pseudo-elements are easier than SVG for this. */}
      <style>{`
        .org-chart, .org-chart ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .org-chart .row {
          display: flex;
          justify-content: center;
          gap: 24px;
          position: relative;
          padding-top: 20px;
        }
        /* The vertical drop from the parent down to the horizontal connector */
        .org-chart .row::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 14px;
          background: rgb(0 0 0 / 0.08);
        }
        .org-chart .child {
          position: relative;
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        /* Horizontal connector + vertical stub above each child */
        .org-chart .child::before,
        .org-chart .child::after {
          content: "";
          position: absolute;
          top: 0;
          height: 1px;
          width: 50%;
          background: rgb(0 0 0 / 0.08);
        }
        .org-chart .child::before { left: 0; }
        .org-chart .child::after  { left: 50%; }
        .org-chart .child:first-child::before { background: transparent; }
        .org-chart .child:last-child::after   { background: transparent; }
        .org-chart .child > .stub {
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 14px;
          background: rgb(0 0 0 / 0.08);
        }
        /* When there's only one child, hide the horizontal arms and only draw
           a centered vertical line. */
        .org-chart .row.single::before { height: 28px; }
        .org-chart .row.single .child::before,
        .org-chart .row.single .child::after { background: transparent; }
        .org-chart .row.single .child > .stub { display: none; }
      `}</style>
    </div>
  );
}

function NodeView({
  node, onSelect, selectedId, isRoot,
}: {
  node: TreeNodeData;
  onSelect: (id: string) => void;
  selectedId: string | null;
  isRoot?: boolean;
}) {
  const hasChildren = node._children.length > 0;
  const single = node._children.length === 1;

  return (
    <li className={isRoot ? "" : "child"}>
      {!isRoot ? <span className="stub" aria-hidden /> : null}
      <NodeCard node={node} onSelect={onSelect} selectedId={selectedId} isRoot={isRoot} />
      {hasChildren ? (
        <div className={cn("row", single && "single")}>
          {node._children.map((c) => (
            <NodeView key={c.id} node={c} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      ) : null}
    </li>
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
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={cn(
        "group relative w-[200px] shrink-0 rounded-xl border p-3 text-left transition-all",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        selected
          ? "border-accent bg-accent/5 shadow-card-hover"
          : isRoot
            ? "border-ink/15 bg-surface shadow-card"
            : "border-hairline bg-surface",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
          {initials(node.name, node.email)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">
            {node.name || node.email.split("@")[0]}
          </p>
          <p className="truncate text-[10px] text-ink-muted">{node.email}</p>
        </div>
        {isRoot ? (
          <span className="rounded-full bg-ink/5 px-1.5 text-[9px] font-medium uppercase tracking-wider text-ink-muted">
            Root
          </span>
        ) : (
          <span className="rounded-full bg-ink/5 px-1.5 text-[9px] font-medium uppercase tracking-wider text-ink-muted">
            T{node._depth}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {node.referral_code ? (
          <code className="rounded border border-hairline bg-surface-subtle px-1 font-mono text-[9.5px] text-ink">
            {node.referral_code}
          </code>
        ) : null}
        {node.intent ? (
          <span
            className={cn(
              "rounded-full border px-1.5 text-[9px] font-medium capitalize",
              INTENT_TONE[node.intent] ?? "border-hairline bg-surface-subtle text-ink-muted",
            )}
          >
            {node.intent}
          </span>
        ) : null}
        {node.is_verified ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-1 text-[9px] font-medium text-emerald-700">
            <Check className="size-2.5" />
          </span>
        ) : null}
        {childCount > 0 ? (
          <span className="ml-auto rounded-full bg-accent/10 px-1.5 text-[10px] font-semibold tabular-nums text-accent">
            +{childCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
