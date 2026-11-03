export const programs = [
  {
    slug: "agroecology",
    kind: "initiative",
    collection: "1a25a23b-4434-47fb-99a7-441d55a32b60",
    name: "Agroecology",
    tagline: "Connecting ecological practices and food systems.",
    summary: "Explore evidence on agroecological innovations and their connections to farming practices, natural resources and livelihoods.",
    paragraphs: ["Explore research on agroecological approaches across farms, landscapes and food systems, including the relationships between ecological processes and agricultural practices.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "aquatic-foods",
    kind: "initiative",
    collection: "92545c45-6347-4bbd-b4ba-b34c05ab2120",
    name: "Aquatic Foods",
    tagline: "Exploring innovation across aquatic food systems.",
    summary: "Explore evidence on fisheries, aquaculture and aquatic food innovations and their connections to nutrition, livelihoods and the environment.",
    paragraphs: ["Aquatic food systems connect water resources, food production and livelihoods. Explore research on practices and technologies across fisheries and aquaculture.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "excellence-in-agronomy",
    kind: "initiative",
    collection: "a80d1192-d4d2-41d0-a544-724f12b86757",
    name: "Excellence in Agronomy",
    tagline: "Connecting agronomic knowledge and farm decisions.",
    summary: "Explore evidence on agronomic innovations, crop management and the use of information to inform farming practices.",
    paragraphs: ["Agronomic research examines how crop management and farming conditions connect to productivity and resource use. Explore innovations in field practices and decision support.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "livestock-and-climate",
    kind: "initiative",
    collection: "b7af7bd2-aae5-47a1-a92b-765805d71c64",
    name: "Livestock and Climate",
    tagline: "Exploring livestock systems in a changing climate.",
    summary: "Explore evidence on livestock innovations and their connections to climate adaptation, environmental outcomes and livelihoods.",
    paragraphs: ["Livestock systems interact with climate, land and water resources. Explore research on practices and technologies addressing these connections across production systems.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "mixed-farming-systems",
    kind: "initiative",
    collection: "661628f6-daf3-48ac-ae21-41f9ba51b7f8",
    name: "Mixed Farming Systems",
    tagline: "Connecting crops, livestock and farm resources.",
    summary: "Explore evidence on innovations in mixed farming and the relationships between crops, livestock and natural resources.",
    paragraphs: ["Mixed farming brings multiple activities together within a farming system. Explore research on integrated practices and the connections between production, resource use and livelihoods.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "nature-positive-solutions",
    kind: "initiative",
    collection: "746e468c-8182-4086-a620-2ed8623f8cab",
    name: "Nature-Positive Solutions",
    tagline: "Connecting food production and biodiversity.",
    summary: "Explore evidence on innovations connecting agriculture, biodiversity, ecosystem restoration and livelihoods.",
    paragraphs: ["Agricultural landscapes support food production alongside a range of ecological processes. Explore research on practices that connect farming with biodiversity and ecosystem management.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "nexus-gains",
    kind: "initiative",
    collection: "89fa7aa2-a43c-4cf8-b38c-a6823e06a980",
    name: "NEXUS Gains",
    tagline: "Connecting water, energy, food and ecosystems.",
    summary: "Explore evidence on innovations across the water, energy, food and ecosystem nexus and their connections to resource management.",
    paragraphs: ["Decisions about water, energy, food and ecosystems are connected. Explore research on technologies and approaches that examine interactions across these resources and sectors.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "sustainable-animal-productivity",
    kind: "initiative",
    collection: "e7f27bd3-aad0-418c-8145-a2e06aa6d6f1",
    name: "Sustainable Animal Productivity",
    tagline: "Exploring productive and sustainable livestock systems.",
    summary: "Explore evidence on animal productivity innovations and their connections to feeding, animal health, resource use and livelihoods.",
    paragraphs: ["Animal productivity depends on connected practices across feeding, health and management. Explore research on livestock innovations and their outcomes across farming systems.", "Browse technological innovation records assigned to this initiative, or visit its CGSpace collection to explore the source publications."],
  },
  {
    slug: "multifunctional-landscapes",
    kind: "science-program",
    collection: "32ac7c8f-6874-4c3a-83b0-6223934600ca",
    name: "Multifunctional Landscapes",
    tagline: "Connecting landscapes, people and nature.",
    summary: "Explore how integrated landscape approaches connect food production, biodiversity and livelihoods. Follow the evidence across agroecological principles and environmental, economic and social outcomes.",
    paragraphs: ["Landscapes support many needs at once: producing food, sustaining biodiversity, maintaining water and soil, and supporting the people who depend on them. An integrated approach helps reveal the connections between these outcomes.", "This evidence synthesis brings research into one view, helping users explore practices across countries, scales and impact domains. Browse the studies behind the evidence or visit the program’s publication collection on CGSpace."],
  },
  {
    slug: "sustainable-animal-and-aquatic-foods",
    kind: "science-program",
    collection: "246d18a3-fdff-4f05-a918-94b617dc158e",
    name: "Sustainable Animal and Aquatic Foods",
    tagline: "Healthy diets. Sustainable food systems.",
    summary: "Explore research on animal and aquatic food systems and their connections to nutrition, livelihoods and the environment.",
    paragraphs: ["Animal and aquatic foods contribute to diets and livelihoods across diverse production systems. Research helps identify practices that support food security while responding to environmental pressures.", "Explore evidence on innovations and their outcomes, from production practices to wider food-system change. The program’s CGSpace collection provides access to its publications."],
  },
  {
    slug: "sustainable-farming",
    kind: "science-program",
    collection: "906d7b6e-625e-4fa4-8022-9e8e6804232a",
    name: "Sustainable Farming",
    tagline: "Resilient farms. Lasting impact.",
    summary: "Explore integrated farm management, agronomic practices and plant health innovations that support productive, resilient farming systems.",
    paragraphs: ["Through integrated farm management solutions, Sustainable Farming connects agronomic practices, plant health innovations and farming-system approaches to food security and sustainable livelihoods.", "The work brings together research institutions, national agricultural research and extension systems, governments, the private sector, civil society and farmers. Explore the evidence behind farming practices and their connections to productivity, natural resources and livelihoods."],
  },
] as const;
export type Program = (typeof programs)[number];
export const programLabel = (program: Program) => program.kind === "initiative" ? "CGIAR Initiative" : "CGIAR Science Program";
export const findProgram = (slug?: string) => programs.find(p => p.slug === slug);
export const publicationUrl = (program: Program) => `https://cgspace.cgiar.org/collections/${program.collection}/search`;

/** CGSpace exports collection names; older sources may use slugs or UUIDs. */
export function matchesCollection(collection: string, program: Program) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const aliases = [program.collection, program.slug, program.name,
    ...(program.kind === "initiative"
      ? [`Initiative ${program.name}`, `CGIAR Initiative on ${program.name}`, `CGIAR Initiative ${program.name}`]
      : [`SP ${program.name}`, `CGIAR Science Program on ${program.name}`]),
  ];
  return aliases.some(alias => normalize(alias) === normalize(collection));
}
