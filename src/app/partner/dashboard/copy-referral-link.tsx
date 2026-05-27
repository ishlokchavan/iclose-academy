"use client";

export function CopyReferralLink({ link }: { link: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded">{link}</span>
      <button
        onClick={() => navigator.clipboard.writeText(link)}
        className="text-sm bg-black text-white px-4 py-2 rounded hover:opacity-80"
      >
        Copy
      </button>
    </div>
  );
}
