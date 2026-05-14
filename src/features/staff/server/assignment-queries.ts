import "server-only";

export type EducatorAssignmentRow = {
  id: string;
  educator: { id: string; full_name: string | null; avatar_url: string | null };
  area: { id: string; slug: string; name: string };
  type: { id: string; slug: string; name: string } | null;
  subarea: string | null;
  created_at: string;
};

export type EducatorWithAssignments = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  assignments: EducatorAssignmentRow[];
};

export async function getEducatorAssignments(): Promise<EducatorAssignmentRow[]> {
  return [];
}
