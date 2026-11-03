# Study data integration

## Local preview data

The application reads every `.json` file directly from `data/study-records/`. Each file may contain one schema-v2 record or an array of records. File names do not affect study identifiers. After adding or replacing files, refresh the development page; production deployments require rebuilding.

The folder contains:

- `provided-irrigation-study.json`: the teammate's supplied record, preserved without modifying its content.
- `demo-01.json` through `demo-15.json`: the original labeled synthetic fixtures.
- `demo-coverage-*.json`: four regional batches containing 4,028 synthetic records. Every country appears in all 11 programs and initiatives. The original 2,156 Science Program records keep the same identifiers and content; another 1,872 records populate the eight Initiatives.

The current preview has 4,044 records: 4,043 demo records and one supplied research record. All fixtures preserve the supplied top-level, deterministic and probabilistic structure. Provenance arrays are empty; notes mark classifications as mock data. No study was extracted from the collection URLs for these batches.

Demo studies use stable synthetic UUIDs, an empty handle, `[Demo]` titles, `extracted_by: "mock-data"`, and the real program collection URL in `deterministic.url`. The UI labels these as collection links. Only the supplied record links to an individual publication. Together with the expanded coverage batches, fixtures cover all 117 countries represented on the map, all 11 programs and initiatives, five impact domains, multiple scales, and a study shared by two collections.

The original legacy `data/studies.json` is unchanged and is no longer the active source. Remove the demo JSON files when replacing them with real exports; keeping them would intentionally keep them in the evidence base.

## Data boundary and Supabase migration

The site's requested map presentation combines the Morocco and Western Sahara source polygons under the label “Morocco.” `data/map-morocco.json` contains the derived exterior boundary, regenerated with `node scripts/generate-morocco-map.mjs`; the original `world.json` and study records are preserved. `lib/countryDisplay.ts` groups the source country labels consistently in the normalized display, so map shading, country filters, chart links and study counts use the same grouping. Multiple source labels on one study are deduplicated.

The flow is:

`lib/studySource.ts` → `lib/normalizeStudies.ts` → `getStudies()` → pages, charts and map.

`fetchStudyRecords()` in `lib/studySource.ts` is the only function to replace when Supabase is ready. It must return the raw deterministic/probabilistic record objects as an array (`Promise<unknown[]>`). If each database row wraps the JSON in a column, unwrap that column in this function. If the API paginates, retrieve all pages here as well.

Keep the Supabase query and credentials on the server. No Supabase client or credentials are needed for the local preview. The normalized `Study` contract, pages, selection logic, charts and map do not change when switching sources.

`normalizeStudies()` accepts schema-v2 records and the previous flat format. It uses `deterministic.item_uuid`, falling back to `deterministic.handle`. Duplicate identifiers are counted once, with collection and tag lists merged. Dates, links, countries, scales, principles and impact domains are mapped from the same fields as the provided file. All raw confidence and provenance fields remain in the JSON; the overview visualizations consume only their normalized labels.

## Collection membership

The catalog in `lib/programs.ts` covers eight CGIAR Initiatives and three CGIAR Science Programs. All 11 have overview pages, CGSpace links, study selection and dashboard scoping. Every collection has labeled demo studies, so users can choose any of the 11 entries on the home page, open Technological innovations, select studies, and view their selection in the dashboard. The study picker also restores the selection when users return to edit it. These fixtures provide the same preview workflow for all 11; they do not represent extracted PDFs.

Grouping uses the full `deterministic.collections` list. The supplied file uses collection **names**, for example `SP Multifunctional Landscapes`. `lib/programs.ts` matches those names, the full CGIAR collection name, a program slug, or a collection UUID. Matching is case-insensitive and ignores surrounding/repeated whitespace.

`deterministic.programs` and `deterministic.initiatives` remain related metadata, not substitutes for collection membership. Missing collections leave a record unassigned, visible only in the general evidence base.

| Program | Exported collection name | CGSpace UUID |
| --- | --- | --- |
| Agroecology | CGIAR Initiative on Agroecology | 1a25a23b-4434-47fb-99a7-441d55a32b60 |
| Aquatic Foods | CGIAR Initiative on Aquatic Foods | 92545c45-6347-4bbd-b4ba-b34c05ab2120 |
| Excellence in Agronomy | CGIAR Initiative on Excellence in Agronomy | a80d1192-d4d2-41d0-a544-724f12b86757 |
| Livestock and Climate | CGIAR Initiative on Livestock and Climate | b7af7bd2-aae5-47a1-a92b-765805d71c64 |
| Mixed Farming Systems | CGIAR Initiative on Mixed Farming Systems | 661628f6-daf3-48ac-ae21-41f9ba51b7f8 |
| Nature-Positive Solutions | CGIAR Initiative on Nature-Positive Solutions | 746e468c-8182-4086-a620-2ed8623f8cab |
| NEXUS Gains | CGIAR Initiative on NEXUS Gains | 89fa7aa2-a43c-4cf8-b38c-a6823e06a980 |
| Sustainable Animal Productivity | CGIAR Initiative on Sustainable Animal Productivity | e7f27bd3-aad0-418c-8145-a2e06aa6d6f1 |
| Multifunctional Landscapes | SP Multifunctional Landscapes | 32ac7c8f-6874-4c3a-83b0-6223934600ca |
| Sustainable Animal and Aquatic Foods | SP Sustainable Animal and Aquatic Foods | 246d18a3-fdff-4f05-a918-94b617dc158e |
| Sustainable Farming | SP Sustainable Farming | 906d7b6e-625e-4fa4-8022-9e8e6804232a |

A study shared by two collections appears in both program views and once in the general dashboard. The study picker and dashboard share `lib/studyScope.ts`, so selected IDs cannot bypass program membership. Selection is encoded in repeated `study=<id>` URL parameters; editing a selection restores it in the picker.

Technological innovations are program-specific: `/innovations` without a program redirects to the program chooser. The home page and general dashboard do not expose an unscoped innovations link.

## Regenerate map coverage fixtures

Run `node scripts/generate-demo-coverage.mjs` with Node.js 22.18 or newer (the script imports the shared TypeScript catalog). It reads `data/world.json` and `data/map-regions.json`, the same geography used by the map. It writes only the four `demo-coverage-*.json` files. Stable identifiers and synthetic distributions make repeated runs reproducible. Each Initiative has one to three demo records per map country, with topics specific to that Initiative. The original three Science Programs retain their previous records unchanged. Countries and regional labels come from the map geometry so they match the map exactly. The supplied research file, legacy data, and original 15 fixtures are untouched.
