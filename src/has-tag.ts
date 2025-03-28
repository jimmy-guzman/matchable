export function hasTag(value: unknown): value is { tag: unknown } {
  return typeof value === "object" && value !== null && "tag" in value;
}
