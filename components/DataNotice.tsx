import type { Study } from "@/lib/getStudies";

export default function DataNotice({ studies }: { studies: Study[] }) {
  const count = studies.filter(study => study.Mock).length;
  if (!count) return null;
  return <aside className="data-notice" aria-label="Demo data notice"><span className="demo-pill">Demo data</span><p>This view includes {count} illustrative {count === 1 ? "study" : "studies"}. Demo links open the program’s CGSpace collection; the supplied research record links to its publication.</p></aside>;
}
