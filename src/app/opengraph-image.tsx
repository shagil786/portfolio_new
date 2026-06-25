import { ImageResponse } from "next/og";
import { profile, links } from "@/data/portfolioData";

export const runtime = "edge";
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#04070a",
          backgroundImage:
            "linear-gradient(rgba(57,255,153,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,153,0.10) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 72,
            border: "2px solid #39ff99",
            borderRadius: 16,
            padding: "16px 22px",
            color: "#39ff99",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          MSN
        </div>

        <div style={{ display: "flex", color: "#22d3ee", fontSize: 26, letterSpacing: 6 }}>
          ● SYSTEM ONLINE // {profile.location.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            color: "#e9fff0",
            fontSize: 80,
            fontWeight: 800,
            marginTop: 18,
            lineHeight: 1.05,
          }}
        >
          {profile.name}
        </div>

        <div style={{ display: "flex", color: "#39ff99", fontSize: 40, marginTop: 14 }}>
          {profile.role}
        </div>

        <div style={{ display: "flex", color: "#8aa79b", fontSize: 28, marginTop: 8 }}>
          {profile.altRole}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            gap: 18,
            color: "#22d3ee",
            fontSize: 24,
          }}
        >
          <span>{links.github.replace("https://", "")}</span>
          <span style={{ color: "#39ff99" }}>·</span>
          <span>{links.linkedin.replace("https://www.", "")}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
