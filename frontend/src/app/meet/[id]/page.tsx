import { redirect } from "next/navigation";

export default async function MeetRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "meet-room-1";
  redirect(`/meetings?room=${encodeURIComponent(id)}`);
}

