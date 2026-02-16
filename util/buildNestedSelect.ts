/**
 * Build Prisma select object from field paths (supports dot notation for relations).
 * e.g. ['email', 'person.firstName', 'person.lastName'] => { email: true, person: { select: { firstName: true, lastName: true } } }
 *
 * @param fieldPaths - Array of field paths (e.g. 'email', 'person.firstName')
 * @param fullRelationSelects - Optional map of relation name -> full select object for bare relation (e.g. select=person). When a path is just "person", use this instead of { person: true }.
 */
export function buildNestedSelect(
  fieldPaths: string[],
  fullRelationSelects?: Record<string, Record<string, boolean>>
): Record<string, unknown> {
  const select: Record<string, unknown> = {};
  const relationFields: Record<string, string[]> = {};

  for (const path of fieldPaths) {
    const trimmed = path.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(".");
    if (parts.length === 1) {
      const key = parts[0];
      if (fullRelationSelects && key in fullRelationSelects) {
        (select as Record<string, unknown>)[key] = {
          select: fullRelationSelects[key],
        };
      } else {
        select[key] = true;
      }
    } else {
      const [relation, ...rest] = parts;
      const nestedPath = rest.join(".");
      if (!relationFields[relation]) relationFields[relation] = [];
      relationFields[relation].push(nestedPath);
    }
  }

  for (const [relation, nestedPaths] of Object.entries(relationFields)) {
    const hasDeeper = nestedPaths.some((p) => p.includes("."));
    (select as Record<string, unknown>)[relation] = {
      select: hasDeeper
        ? buildNestedSelect(nestedPaths, fullRelationSelects)
        : Object.fromEntries([...new Set(nestedPaths)].map((f) => [f, true])),
    };
  }

  return select;
}

/**
 * Normalize select/selects query params into a single array of field paths.
 * Supports: select=email, select=person.firstName, selects=email,name, or array query params.
 */
export function parseSelectFields(select: unknown, selects?: unknown): string[] {
  const raw = [
    ...(Array.isArray(select) ? select : select ? [select] : []),
    ...(typeof selects === "string" ? [selects] : Array.isArray(selects) ? selects : []),
  ];
  return raw
    .flatMap((s) => (typeof s === "string" ? s.split(",").map((f) => f.trim()) : []))
    .filter((f) => f);
}
