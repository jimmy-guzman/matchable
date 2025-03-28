import { deserialize } from "./deserialize";
import { matchable } from "./matchable";

const Result = matchable({
  Failure: (message: string) => {
    return { message };
  },
  Success: (value: number) => {
    return { value };
  },
});

describe("deserialize", () => {
  describe("deserialize", () => {
    it("should parse a valid Success JSON string", () => {
      const json = JSON.stringify(Result.Success(42));
      const result = deserialize(Result, json);

      expect(result).toStrictEqual({ tag: "Success", value: 42 });
    });

    it("should parse a valid Failure JSON string", () => {
      const json = JSON.stringify(Result.Failure("nope"));
      const result = deserialize(Result, json);

      expect(result).toStrictEqual({ message: "nope", tag: "Failure" });
    });

    it("should throw for invalid JSON", () => {
      expect(() => {
        return deserialize(Result, "{not json}");
      }).toThrow("Invalid JSON");
    });

    it("should throw for valid JSON with invalid tag", () => {
      const json = JSON.stringify({ foo: "bar", tag: "Other" });

      expect(() => {
        return deserialize(Result, json);
      }).toThrow("Deserialized object is not a valid variant");
    });

    it("should parse a variant with missing payload", () => {
      const json = JSON.stringify({ tag: "Success" });
      const result = deserialize(Result, json);

      expect(result).toStrictEqual({ tag: "Success" });
    });
  });
});
