import type { Study } from "@/lib/getStudies";

export default function DataNotice({ studies }: { studies: Study[] }) {
  const count = studies.filter(study => study.Mock).length;
  if (!count) return null;
  return <aside className="data-notice" aria-label="Demo data notice"><span className="demo-pill">Simulated preview</span><p>This view includes {count} simulated {count === 1 ? "study" : "studies"}. The preview emphasizes Africa. Country profiles vary: some focus on a single principle or outcome, while others span several. These patterns are illustrative. Demo links open collection pages; the supplied research record links to its publication and retains its original classifications.</p></aside>;
}
