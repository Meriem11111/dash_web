import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Data-source boundary. Replace this function's body with the Supabase query
 * when the database is ready, returning the same raw schema-v2 records.
 * UI components never read local files or talk to the database.
 */
export async function fetchStudyRecords(): Promise<unknown[]> {
  const directory = path.join(process.cwd(), "data", "study-records");
  const files = (await readdir(directory)).filter(file => file.endsWith(".json")).sort();
  const batches = await Promise.all(files.map(async file => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(path.join(directory, file), "utf8"));
    } catch (error) {
      throw new Error(`Unable to read study JSON file ${file}.`, { cause: error });
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  }));
  return batches.flat();
}
