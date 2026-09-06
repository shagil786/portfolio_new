import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import Projects from "@/components/sections/Projects";

export const metadata: Metadata = {
  title: "Projects Lab",
  description: "Deployable project modules built by Md Shagil Nizami across finance, SaaS, CMS, and lending.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <RouteFrame>
      <Projects />
    </RouteFrame>
  );
}
