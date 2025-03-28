import { hasTag } from "./has-tag";

/**
 * Validates if a value matches one of the known tags.
 *
 * Useful for safely checking data loaded from storage, APIs, etc.
 *
 * @param matchable - The matchable instance with `_tags`
 *
 * @param value - The value to check
 *
 * @returns `true` if the value has a valid tag
 */
export function isValid<T extends { _tags: readonly string[] }>(
  matchable: T,
  value: unknown,
): value is { tag: T["_tags"][number] } {
  return (
    hasTag(value) &&
    typeof value.tag === "string" &&
    matchable._tags.includes(value.tag)
  );
}
