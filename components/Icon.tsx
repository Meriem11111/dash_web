export type IconName = "arrow-right" | "external" | "chevron-down" | "download" | "reset" | "search" | "sliders" | "globe" | "layers" | "leaf" | "target";

const paths: Record<IconName, string> = {
  "arrow-right": "M4 12h16m-6-6 6 6-6 6",
  external: "M7 17 17 7M7 7h10v10",
  "chevron-down": "m6 9 6 6 6-6",
  download: "M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  sliders: "M4 7h4m4 0h8M4 17h8m4 0h4M8 4v6m4-6v6m0 4v6m4-6v6M8 7h4m0 10h4",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  leaf: "M20 4C8 2 3 8 5 15s15 5 15-11ZM4 20 15 9",
  target: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
};

export default function Icon({ name }: { name: IconName }) {
  return <svg className="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
