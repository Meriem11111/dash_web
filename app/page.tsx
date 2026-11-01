import Link from "next/link";
import Icon from "@/components/Icon";
import Image from "next/image";
// Give the eager hero a distinct asset URL from the lazy card using this photo.
import heroPhoto from "@/public/photos/vineyard-aerial.jpg";
import SiteHeader from "@/components/SiteHeader";
import ProgramsLink from "@/components/ProgramsLink";
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
    <SiteHeader active="home" />
    <section className="discovery-hero" aria-labelledby="home-title">
      <Image className="discovery-hero-photo" src={heroPhoto} alt="Real aerial view of cultivated vineyard rows in Székelyhíd, Romania" fill loading="eager" fetchPriority="high" sizes="100vw" />
      <div className="discovery-hero-content">
        <p className="discovery-kicker"><span /> CIMMYT / CGIAR · Evidence synthesis</p>
        <h1 id="home-title">Research that sees <em>the bigger picture.</em></h1>
        <p>From the soil beneath our feet to the food on our tables. Explore the science connecting thriving landscapes, sustainable farming and better livelihoods.</p>
        <div className="discovery-hero-actions"><Link className="leaf-button all-studies-button" href="/dashboard">Explore all studies <Icon name="arrow-right" /></Link><ProgramsLink className="outline-button browse-programs-button">Browse by program <Icon name="chevron-down" /></ProgramsLink></div>
      </div>
    </section>


    <main className="discovery-main">
      <section className="discovery-programs" aria-labelledby="programs-title">
        <div className="discovery-section-head"><div><p className="discovery-label">01 / Discover the science</p><h2 id="programs-title">Three programs.<br /><em>A shared future.</em></h2></div></div>
        <div id="programs" className="discovery-program-grid">{programs.map((program, index) => <Link key={program.slug} className={`discovery-program-card program-photo-${index}`} href={`/programs/${program.slug}`}>
          <div className="program-photo"><Image src={photos[index].src} alt={photos[index].alt} fill sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) 38vw, (min-width: 1800px) 450px, (min-width: 1320px) 398px, 33vw" /><span className="program-photo-tag">CGIAR Science Program</span><span className="program-open"><Icon name="arrow-right" /></span></div>
          <div className="program-description"><span className="program-number">0{index + 1}</span><h3>{program.name}</h3><p>{program.tagline}</p><div className="program-card-meta"><span>{scopeStudies(studies, program).length} study records{demoCount ? " · Preview" : ""}</span><span>Explore program <Icon name="arrow-right" /></span></div></div>
        </Link>)}</div>
        <div className="programs-followup"><p>Start with a question. Find your program. Follow the evidence from research to practice, and explore the connections that matter to you.</p><Link href="/dashboard" className="primary-button all-studies-button">Explore all studies <Icon name="arrow-right" /></Link></div>
      </section>
    </main>

    <footer className="discovery-footer"><div><Link className="wordmark" href="/">CIMMYT <span className="brand-divider">/</span> CGIAR</Link><p>Science connected. Evidence explored.</p></div></footer>
  </div>;
}
