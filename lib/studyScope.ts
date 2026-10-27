import type { Study } from "@/lib/getStudies";
import { matchesCollection, type Program } from "@/lib/programs";

/** Apply program membership before selection so URLs cannot leak other programs' studies. */
export function scopeStudies(studies: Study[], program?: Program, selectedIds?: string[]) {
  const selected = selectedIds ? new Set(selectedIds) : undefined;
  return studies.filter(study =>
    (!program || study.Collections.some(collection => matchesCollection(collection, program))) &&
    (!selected || selected.has(study.id))
  );
}
