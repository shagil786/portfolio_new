import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { profile, links } from "@/data/portfolioData";
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
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    worksFor: { "@type": "Organization", name: profile.company },
    address: { "@type": "PostalAddress", addressLocality: profile.location },
    email: links.email,
    url: links.portfolio,
    sameAs: [links.github, links.linkedin],
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
