import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import { getStudies } from "@/lib/getStudies";
import { programs } from "@/lib/programs";
import { scopeStudies } from "@/lib/studyScope";

const photos = [
  { src: "/landscape.jpg", alt: "A patchwork of green and golden fields separated by tree-lined boundaries" },
  { src: "/photos/farmland-mosaic.jpg", alt: "Aerial photograph of diverse agricultural plots in Cheronia, Greece" },
  { src: "/photos/vineyard-aerial.jpg", alt: "Aerial photograph of vineyard rows and a tractor in Romania" },
];

export default async function Page() {
  const studies = await getStudies();
  const demoCount = studies.filter(study => study.Mock).length;

  return <div className="discovery-home" id="top">
    <section className="discovery-hero" aria-labelledby="home-title">
      <Image className="discovery-hero-photo" src="/photos/vineyard-aerial.jpg" alt="Real aerial view of cultivated vineyard rows in Székelyhíd, Romania" fill priority sizes="100vw" />
      <SiteHeader active="home" />
      <div className="discovery-hero-content">
        <p className="discovery-kicker"><span /> CIMMYT / CGIAR · Evidence synthesis</p>
        <h1 id="home-title">Research that sees<br />the <em>bigger picture.</em></h1>
        <p>From the soil beneath our feet to the food on our tables. Explore the science connecting thriving landscapes, sustainable farming and better livelihoods.</p>
        <div className="discovery-hero-actions"><Link className="leaf-button all-studies-button" href="/dashboard">Explore all studies <span aria-hidden="true">↗</span></Link><a className="hero-text-link" href="#programs">Browse by program <span aria-hidden="true">↓</span></a></div>
      </div>
      <div className="hero-bottom"><div className="hero-fieldnote"><span className="fieldnote-symbol" aria-hidden="true">↗</span><p>Different perspectives.<br /><strong>One connected landscape.</strong></p></div><a href="#programs" className="hero-next" aria-label="Scroll to Science Programs">↓</a></div>
    </section>


    <main className="discovery-main">
      <section id="programs" className="discovery-programs">
        <div className="discovery-section-head"><div><p className="discovery-label">01 / Discover the science</p><h2>Three programs.<br /><em>A shared future.</em></h2></div><div><p>Start with a question. Find your program. Follow the evidence from research to practice, and explore the connections that matter to you.</p><Link href="/dashboard" className="primary-button all-studies-button">Explore all studies <span aria-hidden="true">↗</span></Link></div></div>
        <div className="discovery-program-grid">{programs.map((program, index) => <Link key={program.slug} className={`discovery-program-card program-photo-${index}`} href={`/programs/${program.slug}`}>
          <div className="program-photo"><Image src={photos[index].src} alt={photos[index].alt} fill sizes="(max-width: 700px) 100vw, 33vw" /><span className="program-photo-tag">CGIAR Science Program</span><span className="program-open" aria-hidden="true">↗</span></div>
          <div className="program-description"><span className="program-number">0{index + 1}</span><h3>{program.name}</h3><p>{program.tagline}</p><div className="program-card-meta"><span>{scopeStudies(studies, program).length} study records{demoCount ? " · Preview" : ""}</span><span>Explore program →</span></div></div>
        </Link>)}</div>
      </section>
    </main>

    <footer className="discovery-footer"><div><Link className="wordmark" href="/">CIMMYT <span className="brand-divider">/</span> CGIAR</Link><p>Science connected. Evidence explored.</p></div><div><Link href="/#programs">Science Programs</Link><Link href="/dashboard">Dashboard ↗</Link></div></footer>
  </div>;
}
