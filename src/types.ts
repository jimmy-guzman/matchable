/**
 * A mapping of variant names to their payload factory functions.
 *
 * Each key defines a variant constructor that returns an object payload.
 * Used as the input to `matchable()`.
 */
export type VariantMap = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- okay
  (...args: any[]) => Record<string, any>
>;

/**
 * Infers the union type from a `VariantMap`.
 *
 * Wraps each payload in a `{ tag: ... }` object for pattern matching.
 */
export type InferUnion<M extends VariantMap> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- okay
  [K in keyof M]: M[K] extends (...args: any[]) => infer R
    ? R & { tag: K }
    : never;
}[keyof M & string];

/**
 * A handler map for `match()`, where each tag maps to a function.
 *
 * Can optionally include a `default` fallback.
 */
export type MatchHandlers<U extends { tag: string }, R> = {
  [K in Exclude<U["tag"], "default">]?: (value: Extract<U, { tag: K }>) => R;
} & {
  default?: (value: U) => R;
};

/**
 * A more flexible match handler shape that allows partial matching
 * as long as a `default` handler is provided.
 */
export type MatchWithDefault<U extends { tag: string }, R> =
  | MatchHandlers<U, R>
  | (Partial<Omit<MatchHandlers<U, R>, "default">> & {
      default: (value: U) => R;
    });

/**
 * Extracts the union type from a matchable instance.
 *
 * @example
 * const Result = matchable({
 *   Ok: (value: number) => ({ value }),
 *   Err: (message: string) => ({ message }),
 * });
 *
 * type ResultType = MatchableOf<typeof Result>;
 * // => { tag: "Ok"; value: number } | { tag: "Err"; message: string }
 */
export type MatchableOf<T> = T extends {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- okay
  match: (value: infer U, ...args: any[]) => any;
}
  ? U
  : never;

/**
 * Extracts a specific variant from a matchable union.
 *
 * @example
 * type OkVariant = VariantOf<typeof Result, "Ok">;
 * // => { tag: "Ok"; value: number }
 */
export type VariantOf<T, Tag extends string> = Extract<
  MatchableOf<T>,
  { tag: Tag }
>;

/**
 * Extracts the union of all possible `tag` values from a matchable instance.
 *
 * @example
 * const Result = matchable({
 *   Ok: (value: number) => ({ value }),
 *   Err: (error: string) => ({ error }),
 * });
 *
 * type ResultTags = TagsOf<typeof Result>;
 * // => "Ok" | "Err"
 */
export type TagsOf<T> = MatchableOf<T> extends { tag: infer Tag } ? Tag : never;
