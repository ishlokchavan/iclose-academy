import type { Metadata } from "next";
import { AcceptInviteClient } from "./AcceptInviteClient";

export const metadata: Metadata = { title: "Accept Invitation — iClose Academy" };

export default function AcceptInvitePage() {
  return <AcceptInviteClient />;
}
