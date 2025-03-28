import { matchable } from "./matchable";

describe("matchable", () => {
  const Result = matchable({
    Err: (message: string) => {
      return { message };
    },
    Ok: (value: number) => {
      return { value };
    },
  });

  it("should construct tagged variants correctly", () => {
    const ok = Result.Ok(123);
    const err = Result.Err("Something went wrong");

    expect(ok).toMatchObject({ tag: "Ok", value: 123 });

    expect(err).toMatchObject({ message: "Something went wrong", tag: "Err" });
  });

  it("should match exhaustively across all variants", () => {
    const result = Result.Ok(42);

    const output = Result.match(result, {
      Err: ({ message }) => {
        return `Error: ${message}`;
      },
      Ok: ({ value }) => {
        return `Success: ${value}`;
      },
    });

    expect(output).toBe("Success: 42");
  });

  it("should throw if no handler is found for the tag", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- expected
    const bad = { foo: "bar", tag: "Missing" } as any;

    expect(() => {
      Result.match(bad, {
        Err: () => {
          return "";
        },
        Ok: () => {
          return "";
        },
      });
    }).toThrow("Unhandled tag: Missing");
  });

  it("should infer payload types correctly per case", () => {
    const result = Result.Err("Oops");

    const output = Result.match(result, {
      Err: ({ message }) => {
        return message.toUpperCase();
      },
      Ok: ({ value }) => {
        return value.toFixed(2);
      },
    });

    expect(output).toBe("OOPS");
  });

  it("should identify Ok variants and expose the payload", () => {
    const raw: unknown = Result.Ok(100);

    expect(Result.is.Ok(raw)).toBe(true);
    expect(Result.is.Err(raw)).toBe(false);

    const value = raw as { tag: "Ok"; value: number };

    expect(value.value).toBe(100);
  });

  it("should identify Err variants and expose the payload", () => {
    const raw: unknown = Result.Err("fail");

    expect(Result.is.Err(raw)).toBe(true);
    expect(Result.is.Ok(raw)).toBe(false);

    const value = raw as { message: string; tag: "Err" };

    expect(value.message).toBe("fail");
  });

  it("should fallback to default if no handler matches", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- expected
    const result = { tag: "Unknown" } as any;

    const output = Result.match(result, {
      default: (value) => {
        return `Fallback: ${value.tag}`;
      },
      Ok: ({ value }) => {
        return `Success: ${value}`;
      },
    });

    expect(output).toBe("Fallback: Unknown");
  });

  it("should prefer specific handler over default when tag matches", () => {
    const ok = Result.Ok(123);

    const output = Result.match(ok, {
      default: () => {
        return "❌ should not be called";
      },
      Ok: ({ value }) => {
        return `✅ ${value}`;
      },
    });

    expect(output).toBe("✅ 123");
  });

  it("should expose all known tags", () => {
    expect(Result._tags).toStrictEqual(["Err", "Ok"]);
  });

  it("should validate known tags using is.Valid", () => {
    const value = { tag: "Ok", value: 1 };

    expect(Result.is.Valid(value)).toBe(true);
  });

  it("should reject unknown tags using is.Valid", () => {
    const value = { tag: "Nope" };

    expect(Result.is.Valid(value)).toBe(false);
  });

  it("should throw for non-function variant constructors", () => {
    expect(() => {
      matchable({
        // @ts-expect-error intentionally invalid
        Err: 42,
        Ok: (value: number) => {
          return { value };
        },
      });
    }).toThrow("Invalid constructor for tag: Err");
  });

  it("should throw when matching a variant from a different matchable instance", () => {
    const A = matchable({
      Foo: () => {
        return {};
      },
    });
    const B = matchable({
      Foo: () => {
        return {};
      },
    });

    expect(() => {
      return A.match(B.Foo(), {
        Foo: () => {
          return "Should not run";
        },
      });
    }).toThrow("Mismatched matchable instance for tag: Foo");
  });

  it("should throw if payload is missing expected fields", () => {
    const bad = { tag: "Ok" as const };

    expect(() => {
      // @ts-expect-error testing only
      return Result.match(bad, {
        Err: () => {
          return "fail";
        },
        Ok: ({ value }) => {
          return value.toFixed(2);
        },
      });
    }).toThrow("Cannot read properties of undefined (reading 'toFixed')"); // `value` is undefined
  });

  it("should return false if input has no tag", () => {
    const bad = { notTag: true };

    expect(Result.is.Valid(bad)).toBe(false);
  });

  it("should match even if variant has extra properties", () => {
    const noisy = { ...Result.Ok(99), extra: true };

    const output = Result.match(noisy, {
      Err: () => {
        return "fail";
      },
      Ok: ({ value }) => {
        return `Value is ${value}`;
      },
    });

    expect(output).toBe("Value is 99");
  });

  it("should serialize a variant to JSON", () => {
    const result = Result.Ok(42);
    const json = Result.serialize(result);

    expect(JSON.parse(json)).toStrictEqual({ tag: "Ok", value: 42 });
  });

  it("should deserialize a valid JSON string into a variant", () => {
    const json = JSON.stringify(Result.Err("fail"));
    const deserialized = Result.deserialize(json);

    expect(deserialized).toStrictEqual({ message: "fail", tag: "Err" });
    expect(Result.is.Err(deserialized)).toBe(true);
  });

  it("should support round-trip serialization and deserialization", () => {
    const original = Result.Ok(99);
    const roundTrip = Result.deserialize(Result.serialize(original));

    expect(Result.is.Ok(roundTrip)).toBe(true);
    expect(roundTrip).toMatchObject({ tag: "Ok", value: 99 });
  });

  it("should throw on deserializing invalid JSON", () => {
    expect(() => {
      Result.deserialize("{ this is not JSON }");
    }).toThrow("Invalid JSON");
  });

  it("should throw on deserializing object with invalid tag", () => {
    const json = JSON.stringify({ tag: "NotReal" });

    expect(() => {
      Result.deserialize(json);
    }).toThrow("Deserialized object is not a valid variant");
  });
});
