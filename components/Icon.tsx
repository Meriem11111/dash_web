type IconName = "arrow-right" | "external" | "chevron-down" | "download" | "reset" | "search";

const paths: Record<IconName, string> = {
  "arrow-right": "M4 12h16m-6-6 6 6-6 6",
  external: "M7 17 17 7M7 7h10v10",
  "chevron-down": "m6 9 6 6 6-6",
  download: "M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
};

export default function Icon({ name }: { name: IconName }) {
  return <svg className="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
