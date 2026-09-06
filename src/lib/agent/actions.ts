import { useGameStore, type ThemeName } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";

/**
 * Deterministic action matcher — the second fallback stage of the pipeline.
 *
 * The 45M routing model misses open phrasings ("mute the sounds") and can
 * pick wrong-but-valid enum values ("blue" -> theme=purple). This matcher
 * catches obvious action intents with plain regexes and runs the same store
 * mutations as the model tools, so action requests work even before the
 * fine-tuned model ships. Model tools take precedence; this only runs when
 * the model produced no usable answer.
 */

export function matchActionIntent(q: string): string | null {
  const text = q.toLowerCase().trim();

  // Theme words — green / purple / blue, e.g. "make it purple", "blue theme".
  const themeWord = ["green", "purple", "blue"].find((c) =>
    /\b(make|switch|change|set|go|turn|use).*(green|purple|blue)|(green|purple|blue).*(theme|color)|(green|purple|blue)\b/.test(
      text
    ) && text.includes(c)
  );
  if (themeWord && /\b(theme|color|make|switch|change)\b/.test(text)) {
    const theme = themeWord as ThemeName;
    useGameStore.getState().setTheme(theme);
    return `Theme switched to ${THEMES[theme].label}. 🎨`;
  }

  // Sound — mute / unmute / silent / sound.
  if (/\b(mute|muted|silenc|no sound|quiet)\b/.test(text)) {
    if (!useGameStore.getState().muted) useGameStore.getState().toggleMute();
    return "Sound effects muted. 🔇";
  }
  if (/\b(unmute|sound on|turn.*sound|volume)\b/.test(text)) {
    if (useGameStore.getState().muted) useGameStore.getState().toggleMute();
    return "Sound effects on. 🔊";
  }

  // Sections — "open the projects section", "take me to experience".
  if (/\b(open|go to|take me to|jump to)\b/.test(text) && /\b(section|page)\b/.test(text)) {
    const section = ["identity", "experience", "skills", "projects", "achievements", "contact"].find(
      (s) => text.includes(s)
    );
    if (section) {
      useGameStore.getState().setActiveSection(section as never);
      if (typeof document !== "undefined") {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      }
      return `Opening the ${section} section. ▸`;
    }
  }

  // Recruiter / simple resume view.
  if (/\b(recruiter mode|recruiter view|simple resume|clean view)\b/.test(text)) {
    useGameStore.getState().toggleRecruiter();
    const mode = useGameStore.getState().recruiterMode;
    return mode
      ? "Recruiter view on — clean resume mode."
      : "Back to the interactive command center.";
  }

  return null;
}
