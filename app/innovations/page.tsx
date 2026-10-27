import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import StudySelector from "@/components/StudySelector";
import { getStudies } from "@/lib/getStudies";
import { scopeStudies } from "@/lib/studyScope";
import { findProgram } from "@/lib/programs";

export default async function InnovationsPage({ searchParams }: { searchParams: Promise<{ program?: string; study?: string | string[] }> }) {
  const query = await searchParams;
  if (!query.program) redirect("/#programs");
  const program = findProgram(query.program);
  if (!program) notFound();
  const all = await getStudies();
  const studies = scopeStudies(all, program);
  const selected = Array.isArray(query.study) ? query.study : query.study ? [query.study] : [];
  return <><SiteHeader active="innovations" program={program} /><StudySelector key={program.slug} studies={studies} program={program} initialSelection={selected} /></>;
}
