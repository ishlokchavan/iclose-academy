import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ManageTopicPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/manage/topics/${slug}/edit`);
}
