import { fetchStudyRecords } from "@/lib/studySource";
import { normalizeStudies } from "@/lib/normalizeStudies";

export type { Study } from "@/lib/normalizeStudies";

/** The pages and visualizations always consume the same normalized Study shape. */
export async function getStudies() {
  return normalizeStudies(await fetchStudyRecords());
}
