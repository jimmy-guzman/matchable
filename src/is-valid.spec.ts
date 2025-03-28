import { isValid } from "./is-valid";

describe("isValid", () => {
  const Status = {
    _tags: ["Success", "Failure"] as const,
  };

  it("should return true for known tag", () => {
    const value = { tag: "Success" };

    expect(isValid(Status, value)).toBe(true);
  });

  it("should return false for unknown tag", () => {
    const value = { tag: "Unknown" };

    expect(isValid(Status, value)).toBe(false);
  });

  it("should return false for non-object values", () => {
    expect(isValid(Status, null)).toBe(false);
    expect(isValid(Status, undefined)).toBe(false);
    expect(isValid(Status, "string")).toBe(false);
    expect(isValid(Status, 123)).toBe(false);
  });

  it("should return false if tag is missing", () => {
    const value = { notTag: "Success" };

    expect(isValid(Status, value)).toBe(false);
  });
});
