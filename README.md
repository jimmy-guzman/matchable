# matchable

![GitHub Actions](https://img.shields.io/github/actions/workflow/status/jimmy-guzman/matchable/cd.yml?style=flat-square&logo=github-actions)
[![version](https://img.shields.io/npm/v/matchable.svg?logo=npm&style=flat-square)](https://www.npmjs.com/package/matchable)
[![downloads](https://img.shields.io/npm/dm/matchable.svg?logo=npm&style=flat-square)](https://www.npmtrends.com/matchable)
[![semantic-release](https://img.shields.io/badge/semantic--release-automated-blueviolet?style=flat-square)](https://semantic-release.gitbook.io)

> A utility to define and match on tagged unions (like enums with payloads) — safely.

---

## Why matchable?

Rust-style enums or Elm-style `case` matching in TypeScript.

Tagged unions with pattern matching — safely typed and runtime checked.

- Exhaustive matching (TypeScript will catch missing cases)
- Inferred payload types
- One function: `matchable()`
- No runtime dependencies

---

## Installation

```sh
pnpm add matchable
```

---

## Basic Usage

```ts
import { matchable } from "matchable";

const Result = matchable({
  Success: (value: number) => ({ value }),
  Failure: (message: string) => ({ message }),
});

const res = Result.Success(42);

const msg = Result.match(res, {
  Success: ({ value }) => `✅ ${value}`,
  Failure: ({ message }) => `❌ ${message}`,
  // ↑ TS ensures you cover every case
});
```

You must handle every variant — unless you provide a `default`.

---

## Non-Exhaustive Matching

For partial matches, use a `default` fallback:

```ts
const msg = Result.match(Result.Failure("fail"), {
  Success: ({ value }) => `Success: ${value}`,
  default: () => "Something else happened",
});
```

---

## Type Guards

Use `.is` helpers to narrow values:

```ts
const value: unknown = getResultSomehow();

if (Result.is.Success(value)) {
  console.log(value.value); // value: number
}

if (Result.is.Failure(value)) {
  console.error(value.message); // message: string
}
```

You can also validate that a value has a valid tag using `.is.Valid()`:

```ts
if (Result.is.Valid(value)) {
  console.log("Tag is valid:", value.tag);
}
```

Useful in reducers, guards, conditionals, or when validating external data.

---

## Runtime Safety

Unknown tags without a fallback will throw:

```ts
Result.match({ tag: "Missing" } as any, {
  Success: () => "",
  Failure: () => "",
});

// Error: Unhandled tag: Missing
```

This only happens when bypassing the type system (e.g. using `as any`).

---

## Introspection

Check supported tags with `_tags`:

```ts
Result._tags;
// => ["Success", "Failure"]
```

Useful for debugging, docs, or introspective tooling.

---

## Inferring the Union Type

Extract the full union type:

```ts
import type { MatchableOf } from "matchable";

const Result = matchable({
  Success: (value: number) => ({ value }),
  Failure: (message: string) => ({ message }),
});

type ResultType = MatchableOf<typeof Result>;
// => { tag: "Success"; value: number } | { tag: "Failure"; message: string }
```

Extract just the possible `tag` values:

```ts
import type { TagsOf } from "matchable";

type ResultTags = TagsOf<typeof Result>;
// => "Success" | "Failure"
```

This is helpful when you want to work with just the discriminant tags, such as in analytics, testing helpers, or editor tooling.

---

## Group Match Handlers

Use `group()` to organize match handlers that share logic across tags — or to add a fallback handler.

```ts
import { group } from "matchable";

const Status = matchable({
  Idle: () => ({}),
  Loading: () => ({}),
  Success: (data: string) => ({ data }),
  Failure: (message: string) => ({ message }),
});

const log = (status: MatchableOf<typeof Status>) => {
  console.log("handling", status.tag);
};

const handlers = group(Status, {
  Idle: log,
  Loading: log,
  default: (status) => console.log("fallback", status.tag),
});

Status.match(Status.Idle(), handlers); // logs: handling Idle
Status.match(Status.Loading(), handlers); // logs: handling Loading
Status.match(Status.Success("done"), handlers); // logs: fallback Success
```

You can still handle specific cases:

```ts
const handlers = group(Status, {
  Success: (val) => console.log("✅", val),
  Failure: (val) => console.error("❌", val),
  default: () => console.log("Something else"),
});

Status.match(Status.Loading(), handlers); // logs: Something else
```

---

### Serialize and Deserialize

You can serialize a variant to a JSON string — and safely deserialize it back later:

```ts
const original = Result.Success(42);

const json = Result.serialize(original);
// => '{"tag":"Success","value":42}'

const parsed = Result.deserialize(json);
// => { tag: "Success", value: 42 }

if (Result.is.Success(parsed)) {
  console.log(parsed.value); // 42
}
```

Useful when persisting tagged data to localStorage, sending it over the wire, or hydrating server responses.

> Note: Deserialized objects do **not** include internal metadata like `__matchable_id__`, but still pass `is.Valid()` and work with `match()`.

---

## Credits

Inspired by:

- [Rust’s `enum` + `match`](https://doc.rust-lang.org/book/ch06-00-enums.html)
- [Elm’s `case of`](https://guide.elm-lang.org/types/pattern_matching.html)
- [`ts-pattern`](https://github.com/gvergnaud/ts-pattern)

---

PRs and ideas welcome.
