# Reference palette

Source: the user-provided `colorRef.pdf` (16-page concept pitch). Colors were extracted from the PDF's vector RGB paint operators rather than approximated from the rendered photos. The PDF supplies color references only; its pitch text does not change website content or behavior.

| Color | Exact hex | Website role |
| --- | --- | --- |
| Charcoal | `#232326` | Dark page background, light-mode text |
| Slate | `#30383F` | Dark panels, light-mode table headers |
| Mint | `#00FFCC` | Dark-mode highlights and focus accents |
| Turquoise | `#00A888` | Primary actions and chart nodes |
| Deep teal | `#008E99` | Map high counts, light-mode accent borders |
| Aqua | `#00E0B5` | Map and chart scale |
| Pale mint | `#8DFFE9` | Map low counts |
| Periwinkle | `#9BA6FF` | Borders and chart domains |
| Lavender | `#B6A9FF` | Dark-mode heading accents |
| Violet | `#4928FF` | Light-mode heading accents |
| Pale periwinkle | `#DEE1FF` | Light table toolbars and surfaces |
| Pale lavender | `#DBD4FF` | Tags and notice surfaces |
| Light gray | `#F1F1F1` | Light page background and map water |
| Gray | `#E4E4E9` | Dark secondary text and map no-data fill |

Supporting interface and chart colors include the PDF's `#596BFF`, `#BDC4FF`, `#14E6E6`, `#30C1D7`, `#00BF99`, and `#CFFBFB`. White and black are also present in the PDF and are used for contrast. Transparent borders and photographic overlays use these same RGB colors with alpha; no replacement sage or ivory palette remains. The visualizations share `lib/referencePalette.ts`; semantic theme roles are declared in `app/globals.css`.

Map fills retain the reference deep teal, turquoise, aqua, and pale mint as their base colors. To reduce their intensity, each fill blends 65% of its base color with 25% reference gray and 10% reference slate. Custom map gradients receive the same treatment; no-data countries keep the reference gray.
