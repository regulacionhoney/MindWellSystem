export function onlyDefined<T extends Record<string, unknown>>(
  obj: T,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value as string | number | boolean;
    }
  }
  return out;
}