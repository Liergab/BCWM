type ParsedFilterValue = string | number | boolean;
type ParsedFilterObject = Record<string, any>;

// Parses "field:value,nested.field:value2" into a Prisma-compatible where object.
const parseFilterString = (
  filterStr: string
): ParsedFilterObject | undefined => {
  const filters: ParsedFilterObject = {};
  const pairs = filterStr
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const colonIndex = pair.indexOf(":");
    if (colonIndex === -1) continue;

    const key = pair.substring(0, colonIndex).trim();
    const value = pair.substring(colonIndex + 1).trim();
    if (!key || !value) continue;

    let parsedValue: ParsedFilterValue = value;
    if (value === "true") parsedValue = true;
    else if (value === "false") parsedValue = false;
    else if (!isNaN(Number(value)) && value !== "") parsedValue = Number(value);

    const keys = key.split(".");
    if (keys.length === 1) {
      filters[keys[0]] = parsedValue;
      continue;
    }

    let current = filters;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = parsedValue;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

export default parseFilterString;
