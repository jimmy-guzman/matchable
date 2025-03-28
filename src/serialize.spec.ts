import { matchable } from "./matchable";
import { serialize } from "./serialize";

const Result = matchable({
  Failure: (message: string) => {
    return { message };
  },
  Success: (value: number) => {
    return { value };
  },
});

describe("serialize", () => {
  it("should serialize a Success variant", () => {
    const value = Result.Success(42);
    const json = serialize(value);

    expect(JSON.parse(json)).toStrictEqual({ tag: "Success", value: 42 });
  });

  it("should serialize a Failure variant", () => {
    const value = Result.Failure("oops");
    const json = serialize(value);

    expect(JSON.parse(json)).toStrictEqual({ message: "oops", tag: "Failure" });
  });
});
