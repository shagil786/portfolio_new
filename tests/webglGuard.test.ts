import { describe, it, expect } from "vitest";
import { createElement } from "react";
import WebGLGuard from "@/components/three/WebGLGuard";

const fallback = createElement("div", { "data-testid": "fallback" });
const children = createElement("div", { "data-testid": "scene" });

function instance(failed: boolean) {
  const guard = Object.create(WebGLGuard.prototype) as WebGLGuard;
  Object.assign(guard, {
    props: { children, fallback },
    state: { failed },
  });
  return guard;
}

describe("WebGLGuard", () => {
  it("switches to the fallback state on error", () => {
    expect(
      WebGLGuard.getDerivedStateFromError(new Error("Error creating WebGL context"))
    ).toEqual({ failed: true });
  });

  it("renders children when WebGL works", () => {
    expect(instance(false).render()).toBe(children);
  });

  it("renders the low-power fallback when WebGL context creation fails", () => {
    expect(instance(true).render()).toBe(fallback);
  });
});
