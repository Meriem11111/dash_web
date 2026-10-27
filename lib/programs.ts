export const programs = [
  {
    slug: "multifunctional-landscapes",
    collection: "32ac7c8f-6874-4c3a-83b0-6223934600ca",
    name: "Multifunctional Landscapes",
    tagline: "Connecting landscapes, people and nature.",
    summary: "Explore how integrated landscape approaches connect food production, biodiversity and livelihoods. Follow the evidence across agroecological principles and environmental, economic and social outcomes.",
    paragraphs: ["Landscapes support many needs at once: producing food, sustaining biodiversity, maintaining water and soil, and supporting the people who depend on them. An integrated approach helps reveal the connections between these outcomes.", "This evidence synthesis brings research into one view, helping users explore practices across countries, scales and impact domains. Browse the studies behind the evidence or visit the program’s publication collection on CGSpace."],
  },
  {
    slug: "sustainable-animal-and-aquatic-foods",
    collection: "246d18a3-fdff-4f05-a918-94b617dc158e",
    name: "Sustainable Animal and Aquatic Foods",
    tagline: "Healthy diets. Sustainable food systems.",
    summary: "Explore research on animal and aquatic food systems and their connections to nutrition, livelihoods and the environment.",
    paragraphs: ["Animal and aquatic foods contribute to diets and livelihoods across diverse production systems. Research helps identify practices that support food security while responding to environmental pressures.", "Explore evidence on innovations and their outcomes, from production practices to wider food-system change. The program’s CGSpace collection provides access to its publications."],
  },
  {
    slug: "sustainable-farming",
    collection: "906d7b6e-625e-4fa4-8022-9e8e6804232a",
    name: "Sustainable Farming",
    tagline: "Resilient farms. Lasting impact.",
    summary: "Explore integrated farm management, agronomic practices and plant health innovations that support productive, resilient farming systems.",
    paragraphs: ["Through integrated farm management solutions, Sustainable Farming connects agronomic practices, plant health innovations and farming-system approaches to food security and sustainable livelihoods.", "The work brings together research institutions, national agricultural research and extension systems, governments, the private sector, civil society and farmers. Explore the evidence behind farming practices and their connections to productivity, natural resources and livelihoods."],
  },
] as const;
export type Program = (typeof programs)[number];
export const findProgram = (slug?: string) => programs.find(p => p.slug === slug);
export const publicationUrl = (program: Program) => `https://cgspace.cgiar.org/collections/${program.collection}/search`;

/** CGSpace exports collection names; older sources may use slugs or UUIDs. */
export function matchesCollection(collection: string, program: Program) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const aliases = [program.collection, program.slug, program.name, `SP ${program.name}`, `CGIAR Science Program on ${program.name}`];
  return aliases.some(alias => normalize(alias) === normalize(collection));
}
