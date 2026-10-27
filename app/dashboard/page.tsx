import { notFound } from "next/navigation";
import Dashboard from "@/components/dashboard";
import { getStudies } from "@/lib/getStudies";
import { scopeStudies } from "@/lib/studyScope";
import { findProgram } from "@/lib/programs";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ study?: string | string[]; program?: string }> }) {
  const query = await searchParams;
  const program = findProgram(query.program);
  if (query.program && !program) notFound();
  const all = await getStudies();
  const ids = new Set(Array.isArray(query.study) ? query.study : query.study ? [query.study] : []);
  const studies = scopeStudies(all, program, ids.size ? [...ids] : undefined);
  return <Dashboard key={`${program?.slug ?? "all"}:${[...ids].join(",")}`} studies={studies} selected={ids.size > 0} programSlug={program?.slug} />;
}
