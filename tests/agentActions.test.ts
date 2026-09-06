import { describe, it, expect } from "vitest";
import { matchActionIntent } from "@/lib/agent/actions";
import { useGameStore } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";

const reset = () => {
  useGameStore.setState({
    theme: "green",
    muted: true,
    recruiterMode: false,
    activeSection: "hero",
  });
};

describe("action intent matcher", () => {
  it("matches theme changes for every color", () => {
    for (const color of ["green", "purple", "blue"]) {
      reset();
      const reply = matchActionIntent(`make it ${color}`);
      expect(reply).toContain(THEMES[color as "green" | "purple" | "blue"].label);
      expect(useGameStore.getState().theme).toBe(color);
    }
  });

  it("matches 'change the color to blue'", () => {
    reset();
    const reply = matchActionIntent("change the color to blue");
    expect(reply).toContain("Finance Blue");
    expect(useGameStore.getState().theme).toBe("blue");
  });

  it("mutes and unmutes", () => {
    reset();
    useGameStore.setState({ muted: false });
    expect(matchActionIntent("mute the sounds")).toContain("muted");
    expect(useGameStore.getState().muted).toBe(true);
    expect(matchActionIntent("turn the sound on")).toContain("on");
    expect(useGameStore.getState().muted).toBe(false);
  });

  it("opens sections", () => {
    reset();
    const reply = matchActionIntent("open the projects section");
    expect(reply).toContain("projects");
    expect(useGameStore.getState().activeSection).toBe("projects");
  });

  it("toggles recruiter mode", () => {
    reset();
    const before = useGameStore.getState().recruiterMode;
    expect(matchActionIntent("recruiter mode")).toContain("Recruiter view");
    expect(useGameStore.getState().recruiterMode).toBe(!before);
  });

  it("returns null for non-action questions", () => {
    expect(matchActionIntent("what did he do at finbox?")).toBeNull();
    expect(matchActionIntent("show me his projects")).toBeNull();
  });
});
