import type { MatchableInstanceId } from "./symbol";
import type { InferUnion, MatchWithDefault, VariantMap } from "./types";

import { createIs } from "./create-is";
import { deserialize } from "./deserialize";
import { serialize } from "./serialize";

/**
 * Creates a tagged union and a type-safe matcher.
 *
 * Each key in `variants` becomes a constructor function that returns
 * an object with a `tag` and a payload. Use `match()` to handle variants
 * exhaustively, or include a `default` handler for partial matching.
 *
 * @param variants - A map of variant names to factory functions.
 *
 * @returns An object with:
 * - constructors for each variant
 * - a `match()` function for safe pattern matching
 * - a `is` object with type guards
 * - `_tags` listing supported tags
 *
 * @example
 * const Result = matchable({
 *   Ok: (value: number) => ({ value }),
 *   Err: (message: string) => ({ message }),
 * });
 *
 * const result = Result.Ok(42);
 * const msg = Result.match(result, {
 *   Ok: ({ value }) => `✅ ${value}`,
 *   Err: ({ message }) => `❌ ${message}`,
 * });
 */
export function matchable<const M extends VariantMap>(variants: M) {
  type Tag = keyof M & string;
  type Union = InferUnion<M> & { __matchable_id__?: symbol };

  const id: MatchableInstanceId = Symbol(
    "matchable.instance",
  ) as MatchableInstanceId;

  const constructors = {} as {
    [K in Tag]: (...args: Parameters<M[K]>) => ReturnType<M[K]> & {
      __matchable_id__: typeof id;
      tag: K;
    };
  };

  const _tags = Object.keys(variants) as Tag[];

  const is = createIs(_tags);

  for (const tag of _tags) {
    const factory = variants[tag];

    if (typeof factory !== "function") {
      throw new TypeError(`Invalid constructor for tag: ${tag}`);
    }

    constructors[tag] = ((...args: Parameters<typeof factory>) => {
      const payload = factory(...args) as ReturnType<typeof factory>;

      return {
        tag,
        ...payload,
        __matchable_id__: id,
      };
    }) as (typeof constructors)[typeof tag];
  }

  /**
   * Pattern matches on a tagged union.
   *
   * Requires all cases to be handled unless a `default` handler is provided.
   * Ensures the matched variant belongs to the same matchable instance.
   *
   * @param value - A value created by one of the variant constructors.
   *
   * @param handlers - An object with functions for each variant tag, or a `default` fallback.
   *
   * @returns The result of the matching handler.
   */
  function match<R>(value: Union, handlers: MatchWithDefault<Union, R>): R {
    const { tag } = value;

    if ("__matchable_id__" in value && value.__matchable_id__ !== id) {
      throw new Error(`Mismatched matchable instance for tag: ${tag}`);
    }

    if (tag in handlers) {
      const handler = handlers[tag as keyof typeof handlers] as
        | ((value: Union) => R)
        | undefined;

      if (typeof handler === "function") {
        return handler(value);
      }
    }

    if ("default" in handlers && typeof handlers.default === "function") {
      return handlers.default(value);
    }

    throw new Error(`Unhandled tag: ${tag}`);
  }

  return {
    ...constructors,
    _tags,
    deserialize: (json: string) => {
      return deserialize({ _tags, is }, json);
    },
    is,
    match,
    serialize,
  };
}
