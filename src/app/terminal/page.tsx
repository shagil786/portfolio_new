import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import Terminal from "@/components/terminal/Terminal";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Full-screen hacker terminal — explore Md Shagil Nizami's portfolio by command.",
  alternates: { canonical: "/terminal" },
};

export default function TerminalPage() {
  return (
    <RouteFrame>
      <h1 className="mb-2 font-display text-2xl font-bold neon-text md:text-3xl">
        Root Terminal
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink/60">
        Type <code className="text-neon">help</code> to list commands. Arrow keys recall
        history, Tab autocompletes. Hidden command:{" "}
        <code className="text-neon">sudo hire shagil</code>.
      </p>
      <Terminal fullscreen />
    </RouteFrame>
  );
}
