import type { Study } from "@/lib/getStudies";

function topOf(studies: Study[], key: "Principles" | "Domains") {
  const tally: Record<string, number> = {};
  for (const s of studies) for (const value of s[key]) tally[value] = (tally[value] ?? 0) + 1;
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

export default function CountryPanel({ country, studies }: { country: string; studies: Study[] }) {
  const scales = Array.from(new Set(studies.map((s) => s.Scale))).sort();

  return (
    <div className="mb-4 rounded-md border border-line bg-card p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-mint">Selected country</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{country}</h2>
      <p className="text-sm text-muted">{studies.length} studies</p>
      <div className="my-4 h-px bg-line" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted">Top principle</p>
          <p className="font-semibold text-[var(--ink)]">{topOf(studies, "Principles")}</p>
        </div>
        <div>
          <p className="text-muted">Top impact domain</p>
          <p className="font-semibold text-[var(--ink)]">{topOf(studies, "Domains")}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        {scales.map((sc) => (
          <span key={sc}>
            {sc}: <strong className="text-mint">{studies.filter((s) => s.Scale === sc).length}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}