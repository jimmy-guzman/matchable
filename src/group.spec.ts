import { describe, expect, it } from "vitest";

import { group } from "./group";
import { matchable } from "./matchable";

const Status = matchable({
  error: (message: string) => {
    return { message };
  },
  idle: () => {
    return {};
  },
  loading: () => {
    return {};
  },
  success: (data: string) => {
    return { data };
  },
});

describe("group", () => {
  it("should merge multiple tags to the same handler", () => {
    const log = vi.fn();

    const handlers = group(Status, {
      idle: log,
      loading: log,
    });

    Status.match(Status.idle(), handlers);
    Status.match(Status.loading(), handlers);

    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should support merging with a default fallback", () => {
    const fallback = vi.fn();

    const handlers = group(Status, {
      default: fallback,
    });

    Status.match(Status.success("yay"), handlers);
    Status.match(Status.error("fail"), handlers);

    expect(fallback).toHaveBeenCalledTimes(2);
  });

  it("should return a valid MatchHandlers object", () => {
    const success = vi.fn();
    const error = vi.fn();

    const handlers = group(Status, {
      error,
      success,
    });

    const result = Status.match(Status.success("done"), handlers);

    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({ data: "done", tag: "success" }),
    );

    expect(result).toBeUndefined();
  });

  it("should throw if no handler matches and no default is provided", () => {
    const handlers = group(Status, {});

    expect(() => {
      Status.match(Status.success("fail"), handlers);
    }).toThrow("Unhandled tag: success");
  });

  it("should prefer specific handlers over default", () => {
    const fallback = vi.fn();
    const success = vi.fn();

    const handlers = group(Status, {
      default: fallback,
      success,
    });

    Status.match(Status.success("cool"), handlers);

    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({ data: "cool", tag: "success" }),
    );

    expect(fallback).not.toHaveBeenCalled();
  });

  it("should use fallback in group if tag not handled explicitly", () => {
    const Status = matchable({
      Err: () => {
        return {};
      },
      Idle: () => {
        return {};
      },
      Loading: () => {
        return {};
      },
    });

    const handlers = group(Status, {
      default: ({ tag }) => {
        return `Fallback: ${tag}`;
      },
      Idle: () => {
        return "Handled Idle";
      },
    });

    expect(Status.match(Status.Idle(), handlers)).toBe("Handled Idle");
    expect(Status.match(Status.Err(), handlers)).toBe("Fallback: Err");
  });

  it("should throw on unknown tag not handled and no default", () => {
    const handlers = group(Status, {
      success: vi.fn(),
    });

    const rogue = { data: "", tag: "Unknown" as "success", value: 123 };

    expect(() => {
      Status.match(rogue, handlers);
    }).toThrow("Unhandled tag: Unknown");
  });
});
