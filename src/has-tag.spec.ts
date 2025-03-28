import { hasTag } from "./has-tag";

describe("hasTag", () => {
  it("should return true for objects with a tag field", () => {
    expect(hasTag({ tag: "Ok" })).toBe(true);
  });

  it("should return false for null or non-objects", () => {
    expect(hasTag(null)).toBe(false);
    expect(hasTag("hello")).toBe(false);
    expect(hasTag(42)).toBe(false);
  });

  it("should return false for objects without a tag", () => {
    expect(hasTag({ status: "Ok" })).toBe(false);
  });
});
