import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Md Shagil Nizami — email, phone, GitHub, and LinkedIn.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <RouteFrame>
      <Contact />
    </RouteFrame>
  );
}
