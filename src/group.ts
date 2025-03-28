import type { MatchableOf, MatchWithDefault } from "./types";

/**
 * Merges multiple match handlers into a single handler map,
 * preserving the shape expected by `.match()`.
 *
 * Useful when multiple tags share logic and should map
 * to the same function. You can still provide a `default`
 * fallback for any unhandled tags.
 *
 * @param matchable - A matchable instance with `_tags` and `match()`
 *
 * @param handlers - A partial set of handlers for specific tags, plus optional `default`
 *
 * @returns A `MatchWithDefault` handler map compatible with `match()`
 *
 * @example
 * const handlers = group(Result, {
 *   Ok: handleSuccess,
 *   Cached: handleSuccess,
 *   Err: handleError,
 * });
 *
 * const message = Result.match(value, handlers);
 */
export function group<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- it's okay
  T extends { match: (value: any, handlers: any) => any },
  R,
>(
  matchable: T & { _tags: readonly string[] },
  handlers: Partial<
    Record<MatchableOf<T>["tag"], (value: MatchableOf<T>) => R>
  > & {
    default?: (value: MatchableOf<T>) => R;
  },
): MatchWithDefault<MatchableOf<T>, R> {
  const merged: Partial<Record<string, (value: MatchableOf<T>) => R>> = {};

  for (const tag of matchable._tags as MatchableOf<T>["tag"][]) {
    const handler = handlers[tag];

    if (handler) {
      merged[tag] = handler;
    }
  }

  if (handlers.default) {
    merged.default = handlers.default;
  }

  return merged as MatchWithDefault<MatchableOf<T>, R>;
}
