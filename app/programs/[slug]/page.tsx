import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { findProgram, programs, publicationUrl } from "@/lib/programs";

export function generateStaticParams() { return programs.map(p => ({ slug: p.slug })); }
export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const program = findProgram((await params).slug);
  if (!program) notFound();
  return <><SiteHeader active="overview" program={program} /><main className="dashboard-main overview-main"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#programs">Science Programs</Link><span>/</span>Overview</div><p className="eyebrow">CGIAR Science Program</p><h1 className="program-title">{program.name}</h1><p className="overview-intro">{program.summary}</p><section className="overview-content"><div><p className="eyebrow">01 / About the program</p><h2>{program.tagline}</h2></div><div>{program.paragraphs.map(p => <p key={p}>{p}</p>)}</div></section><div className="overview-options"><Link href={`/innovations?program=${program.slug}`} className="action-card"><p className="eyebrow">Explore the evidence</p><h2>Technological innovations <span aria-hidden="true">→</span></h2><p>Choose studies and follow their connections in the dashboard.</p></Link><a href={publicationUrl(program)} target="_blank" rel="noreferrer" className="action-card publication-card"><p className="eyebrow">Visit CGSpace</p><h2>See all publications <span aria-hidden="true">↗</span></h2><p>Browse the complete program collection. Opens in a new tab.</p></a></div><footer className="site-footer"><span>CIMMYT / CGIAR</span><Link href="/#programs">← All Science Programs</Link></footer></main></>;
}
