import { hasTag } from "./has-tag";

/**
 * Creates type guard functions for each tag in a tagged union.
 *
 * Returns an object with:
 * - one `is.X()` function per tag, which narrows the type
 * - a `.Valid()` function to check if a value has a valid tag
 *
 * @param tags - A list of variant tags to support.
 *
 * @returns An object with tag-specific type guards and a `.Valid()` validator.
 *
 * @example
 * const is = createIs(["Ok", "Err"]);
 *
 * if (is.Ok(value)) {
 *   // value is { tag: "Ok" }
 * }
 *
 * if (is.Valid(value)) {
 *   console.log(value.tag); // safe to access
 * }
 */
export function createIs<Tag extends string>(
  tags: readonly Tag[],
): {
  [K in Tag]: (value: unknown) => value is { tag: K };
} & {
  Valid: (value: unknown) => value is { tag: Tag };
} {
  const is = {} as {
    [K in Tag]: (value: unknown) => value is { tag: K };
  };

  for (const tag of tags) {
    is[tag] = ((value: unknown): value is { tag: typeof tag } => {
      return hasTag(value) && value.tag === tag;
    }) as (typeof is)[Tag];
  }

  const withValid = {
    ...is,
    Valid: (value: unknown): value is { tag: Tag } => {
      return (
        hasTag(value) &&
        typeof value.tag === "string" &&
        tags.includes(value.tag as Tag)
      );
    },
  };

  return withValid;
}
