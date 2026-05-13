import { requireUser } from "@/lib/auth/guards";

export default async function LessonGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
