import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DesignFeedback } from "@/components/portal/DesignFeedback";
import { getClientData } from "@/lib/bot-api";
import { getI18n } from "@/lib/i18n/server";
import { getSession } from "@/lib/session";

export const metadata = { title: "Feedback op ontwerp", robots: { index: false } };

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session, { locale, lp }] = await Promise.all([params, getSession(), getI18n()]);
  if (!session || session.demo) redirect(lp("/klantportaal"));
  if (!/^[a-f0-9]{10}$/.test(id)) notFound();
  const data = await getClientData(session.id);
  const file = data?.bestanden?.find((f) => f.id === id);
  if (!file) notFound();
  const en = locale === "en";
  return (
    <section className="container pb-24 pt-32 sm:pt-40">
      <Link href={`${lp("/klantportaal")}#bestanden`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> {en ? "Back to your files" : "Terug naar je bestanden"}</Link>
      <h1 className="mb-6 mt-6 text-3xl font-semibold">{en ? "Feedback on" : "Feedback op"} {file.naam}</h1>
      <DesignFeedback fileId={id} />
    </section>
  );
}
