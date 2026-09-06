import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { profile, links, education } from "@/data/portfolioData";
import { SITE_URL } from "@/lib/site";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const description = `${profile.name} — ${profile.role}. ${profile.summary}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.shortName} OS`,
  },
  description,
  alternates: { canonical: "/" },
  keywords: [
    "Md Shagil Nizami",
    "Software Development Engineer",
    "Frontend Developer",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Bangalore",
    "Yahoo",
    "Micro-frontends",
    "SaaS",
  ],
  authors: [{ name: profile.name, url: links.portfolio }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: `${profile.name} · ${profile.role}`,
    description,
    siteName: `${profile.shortName} OS`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.role}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: profile.name,
        alternateName: profile.shortName,
        description: profile.summary,
        disambiguatingDescription: `${profile.role} at ${profile.company} based in ${profile.location}, specializing in ${profile.specializations.slice(0, 3).join(", ")}.`,
        jobTitle: profile.role,
        worksFor: { "@id": `${SITE_URL}/#organization` },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: education[0]?.institution,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
        email: `mailto:${links.email}`,
        telephone: links.phone,
        url: SITE_URL,
        knowsAbout: profile.specializations,
        sameAs: [links.github, links.linkedin],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "MSN OS",
        url: SITE_URL,
        description: `Personal portfolio and command center of ${profile.name}, ${profile.role} at ${profile.company}.`,
        founder: { "@id": `${SITE_URL}/#person` },
        email: links.email,
        telephone: links.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "recruiting and business inquiries",
          email: links.email,
          telephone: links.phone,
          availableLanguage: ["English"],
        },
        sameAs: [links.github, links.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: `${profile.shortName} OS`,
        description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en" className={`${mono.variable} ${display.variable}`}>
      <body className="scanlines antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
