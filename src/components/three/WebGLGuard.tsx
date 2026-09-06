"use client";

import { Component, type ReactNode } from "react";

/**
 * WebGL and GPU-less environments (headless browsers, some VMs, driverless
 * machines) throw when the R3F Canvas creates its context, which unmounts the
 * whole app. Catch it and fall back to the low-power grid instead.
 */
export default class WebGLGuard extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(_error: Error) {
    return { failed: true };
  }

  componentDidCatch() {
    // Renderer unavailable — the fallback is the same visual used for
    // low-power devices, so no further action needed.
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
