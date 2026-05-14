"use server";

export type ActionResult = { error?: string };

// Educator assignment routing was removed when the educator user role was
// replaced by a standalone educators table. These stubs keep imports from
// breaking while the AssignmentManager component is awaiting removal.

export async function createAssignmentAction(): Promise<ActionResult> {
  return { error: "Not implemented" };
}

export async function deleteAssignmentAction(): Promise<ActionResult> {
  return { error: "Not implemented" };
}

export async function rerouteAllOpenInquiriesAction(): Promise<ActionResult> {
  return {};
}
