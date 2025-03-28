import { createIs } from "./create-is";

describe("createIs", () => {
  const tags = ["Ok"] as const;
  const is = createIs(tags);

  it("should return true for a matching tag", () => {
    const value = { tag: "Ok", value: 123 };

    expect(is.Ok(value)).toBe(true);
  });

  it("should return false for a non-matching tag", () => {
    const value = { message: "fail", tag: "Err" };

    expect(is.Ok(value)).toBe(false);
  });

  it("should return false for non-object inputs", () => {
    expect(is.Ok(null)).toBe(false);
    expect(is.Ok("not-an-object")).toBe(false);
    expect(is.Ok(42)).toBe(false);
  });

  it("should return false if object lacks tag", () => {
    expect(is.Ok({ value: 123 })).toBe(false);
  });

  it("should validate using .Valid() for known tag", () => {
    const value = { tag: "Ok", value: 123 };

    expect(is.Valid(value)).toBe(true);
  });

  it("should fail .Valid() for unknown tag", () => {
    const value = { tag: "NotOk" };

    expect(is.Valid(value)).toBe(false);
  });
});
