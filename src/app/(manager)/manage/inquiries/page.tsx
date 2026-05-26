import type { Metadata } from "next";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { Inbox } from "lucide-react";

import { InquiriesTable } from "@/features/inquiries/components/InquiriesTable";
import { getAllInquiriesForStaff } from "@/features/inquiries/server/queries";

export const metadata: Metadata = { title: "Inquiries" };

export default async function ManageInquiriesPage() {
  // Fetch all inquiries — the table provides per-column filters including
  // status, so URL-driven status filtering is no longer needed.
  const items = await getAllInquiriesForStaff();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Inquiries"
        description="All inquiries from learners. Respond, follow up, or close."
      />

      {items.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" description="No inquiries yet." />
      ) : (
        <InquiriesTable inquiries={items} />
      )}
    </div>
  );
}
