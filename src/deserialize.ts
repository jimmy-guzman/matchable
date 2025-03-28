import type { InferUnion, VariantMap } from "./types";

export function deserialize<M extends VariantMap, U extends InferUnion<M>>(
  matchable: {
    _tags: readonly string[];
    is: { Valid: (value: unknown) => value is U };
  },
  json: string,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- it's okay
    const parsed = JSON.parse(json);

    if (!matchable.is.Valid(parsed)) {
      throw new TypeError("Deserialized object is not a valid variant");
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TypeError("Invalid JSON");
    }

    throw error;
  }
}
