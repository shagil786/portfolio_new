import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import RecruiterView from "@/components/sections/RecruiterView";

export const metadata: Metadata = {
  title: "Resume",
  description: "Clean, scannable resume for Md Shagil Nizami — Software Development Engineer II.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <RouteFrame back={false}>
      <RecruiterView />
    </RouteFrame>
  );
}
