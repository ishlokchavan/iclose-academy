import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryForm } from "@/features/inquiries/components/InquiryForm";
import { getTaxonomy } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Post an inquiry" };

export default async function NewInquiryPage() {
  const user = await requireUser();
  const { areas, types, subtypes } = await getTaxonomy();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Lead"
        title="Post an inquiry"
        description="Describe what your client is looking for. The platform routes it to the specialist who covers that area."
      />
      <div className="rounded-xl border border-hairline bg-surface-raised p-6">
        <InquiryForm
          areas={areas}
          types={types}
          subtypes={subtypes}
          prefill={{ email: user.email }}
        />
      </div>
    </div>
  );
}
