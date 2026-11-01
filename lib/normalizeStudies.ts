import { displayCountryName } from "@/lib/countryDisplay";

/**
 * One Study = one publication (one CGSpace item).
 * A study can have several countries, principles and domains, so those are arrays.
 */
export type Study = {
  id: string;
  Mock: boolean;
  Collections: string[]; // many-to-many membership from deterministic.collections
  Title: string;
  Url: string;
  Year: string;
  Countries: string[];
  Regions: string[];
  Scale: string;
  Principles: string[];
  Domains: string[];
  Innovation: string; // is_technological_innovation.value ("" if unknown)
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

const str = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v).trim();

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter(Boolean) : [];

const unique = (xs: string[]) => Array.from(new Set(xs));

/* ---------- NEW format: the teammate's database (schema.md) ---------- */
function fromSchema(r: Rec): Study {
  const d: Rec = r.deterministic ?? {};
  const p: Rec = r.probabilistic ?? {};

  // country: CGSpace metadata first, geolocation block as fallback
  const countries = list(d.country).length
    ? list(d.country)
    : list(p.geolocation?.country_from_metadata);

  return {
    id: str(d.item_uuid) || str(d.handle),
    Mock: r.extracted_by === "mock-data",
    Collections: unique(list(d.collections)),
    Title: str(d.title),
    Url: str(d.url),
    Year: str(d.issued).slice(0, 4),
    Countries: unique(countries.map(displayCountryName)),
    Regions: unique(list(d.region)),
    Scale: str(p.scale?.value) || "Unspecified",
    Principles: unique(
      ((p.agroecological_principles ?? []) as Rec[]).map((x) => str(x.code)).filter(Boolean)
    ),
    Domains: unique(
      ((p.impact_domains ?? []) as Rec[]).map((x) => str(x.code)).filter(Boolean)
    ),
    Innovation: str(p.is_technological_innovation?.value),
  };
}

/* ---------- OLD flat format (kept so the dashboard still works until the new data lands) ---------- */
function pick(r: Rec, ...keys: string[]): string {
  for (const k of keys) {
    if (r[k] !== undefined && r[k] !== null && r[k] !== "") return String(r[k]).trim();
  }
  return "";
}

function fromFlat(r: Rec, i: number): Study {
  const principle = pick(r, "Agroecological_Principles", "Principle");
  const domain = pick(r, "Impact_Domain", "Domain");
  const country = pick(r, "Country");
  return {
    id: pick(r, "Study_ID", "id") || String(i),
    Mock: false,
    Collections: list(r.Collections).length ? unique(list(r.Collections)) : [pick(r, "Collection_ID")].filter(Boolean),
    Title: pick(r, "Study_Title_or_Source", "Title"),
    Url: "",
    Year: "",
    Countries: country ? [displayCountryName(country)] : [],
    Regions: [],
    Scale: pick(r, "Scale") || "Unspecified",
    Principles: principle ? [principle] : [],
    Domains: domain ? [domain] : [],
    Innovation: "",
  };
}

export function normalizeStudies(records: unknown[]): Study[] {
  const byId = new Map<string, Study>();
  records.forEach((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error(`Study record ${index + 1} must be a JSON object.`);
    }
    const r = record as Rec;
    const study = r.deterministic || r.probabilistic ? fromSchema(r) : fromFlat(r, index);
    if (!study.id) throw new Error(`Study record ${index + 1} is missing item_uuid or handle.`);
    const existing = byId.get(study.id);
    if (existing) {
      for (const key of ["Collections", "Countries", "Regions", "Principles", "Domains"] as const) {
        existing[key] = unique([...existing[key], ...study[key]]);
      }
    } else byId.set(study.id, study);
  });
  return [...byId.values()];
}
