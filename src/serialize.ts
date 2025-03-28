import type { InferUnion, VariantMap } from "./types";

export function serialize<M extends VariantMap>(value: InferUnion<M>) {
  return JSON.stringify(value);
}
