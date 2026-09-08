/**
 * Helpers for honouring the `accept` contract of `<input type="file">`.
 *
 * The browser only applies `accept` to the OS file picker, so drag-and-drop has
 * to be checked in JS. An accept list can mix dot-prefixed extensions
 * (".json"), exact MIME types ("application/json") and wildcard MIME types
 * ("text/*"), and each kind matches against a different part of the file.
 */

export const parseAccept = (accept: string) =>
  accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const matchesEntry = (file: File, entry: string) => {
  if (entry === "*" || entry === "*/*") return true;
  if (entry.startsWith(".")) {
    return file.name.toLowerCase().endsWith(entry);
  }
  const type = file.type.toLowerCase();
  if (entry.endsWith("/*")) {
    return type.startsWith(entry.slice(0, -1));
  }
  return type === entry;
};

/**
 * Whether `file` satisfies any entry of a parsed accept list. An empty list
 * accepts everything, matching the browser's behaviour for a missing `accept`.
 */
export const matchesAccept = (file: File, entries: string[]) => {
  if (entries.length === 0) return true;
  return entries.some((entry) => matchesEntry(file, entry));
};

/**
 * Human-readable tail for an error message, phrased for the kind of entries in
 * the list so an extension-only list doesn't read as MIME types or vice versa.
 */
export const describeAccept = (entries: string[]) => {
  const extensions = entries.filter((entry) => entry.startsWith("."));
  if (extensions.length === entries.length) {
    return `ending in ${extensions.join(", ")}`;
  }
  if (extensions.length === 0) {
    return `of type ${entries.join(", ")}`;
  }
  return `matching ${entries.join(", ")}`;
};
