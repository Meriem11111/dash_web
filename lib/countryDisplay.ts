/** Country grouping used by this site's requested map presentation. */
export function displayCountryName(name: string): string {
  return /^(w\.?\s*sahara|western sahara)$/i.test(name.trim()) ? "Morocco" : name;
}
