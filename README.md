# MSN OS — Interactive 3D Hacker Portfolio

A futuristic, game-like portfolio experience for **Md Shagil Nizami** — Software Development Engineer II. Visitors boot into "MSN OS", explore a 3D command center, and unlock career missions, skills, projects, and achievements. Recruiters can flip a switch for a clean, scannable resume.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Three Fiber · Framer Motion · Zustand**.

---

## ✨ Features

- **Boot sequence** — fake hacker boot with typing, progress bar, and skip.
- **3D command center** — R3F scene with cyber grid, floating core, holo panels, skill orbs, particles, mouse-parallax camera, and bloom + chromatic aberration postprocessing.
- **Mission map** — sections presented as unlockable missions; XP bar fills as you scroll.
- **Experience as game levels** — expandable mission logs with impact badges and tech chips.
- **Skills arsenal** — category-switching holographic panels with symbolic power levels.
- **Projects lab** — deployable module cards with a "deploy simulation" animation.
- **Real terminal** — `help`, `about`, `experience yahoo`, `skills`, `projects`, `contact`, `github`, `linkedin`, `resume`, `clear`, `unlock all`, plus easter eggs (`sudo hire shagil`, `matrix`, `hack`, `coffee`). History + Tab-complete.
- **Debug-the-bug minigame** — fix snippets to earn an achievement.
- **MSN AI bot** — floating guide with contextual tips.
- **Command palette** — `⌘K` / `Ctrl+K` fuzzy actions.
- **Recruiter mode** — clean resume view toggle.
- **3 themes** — Hacker Green / Cyber Purple / Finance Blue (CSS-variable driven).
- **Achievements** — animated unlock badges.
- **Minimap**, sound toggle (synth SFX, no assets), reduced-motion + low-power 3D modes.
- **SEO** — metadata, JSON-LD Person schema, semantic HTML.

## 🗂 Routes

| Route        | Description                          |
|--------------|--------------------------------------|
| `/`          | Main interactive game portfolio      |
| `/resume`    | Clean recruiter resume view          |
| `/terminal`  | Full-screen hacker terminal          |
| `/projects`  | Projects lab                         |
| `/contact`   | Contact page                         |

## 🚀 Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

Type-check:

```bash
npm run typecheck
```

## 🛠 Editing content

Everything lives in **`src/data/portfolioData.ts`** — profile, links, skills, experience, projects, achievements, missions, and boot lines. Update there and it flows across the 3D world, terminal, resume, and every route.

The downloadable resume is `public/resume.pdf`. Replace it with your own export anytime; the "Download Resume" buttons point to `/resume.pdf`.

## ⚡ Performance & accessibility

- 3D `<Canvas>` is `dynamic({ ssr: false })` and lazy-loaded with a fallback.
- `prefers-reduced-motion` disables decorative animation and the matrix rain.
- Low-power mode (auto-detected on small / low-core devices) drops postprocessing, particle counts, and DPR — toggle it manually in the HUD.
- Keyboard accessible terminal, palette, and focus-visible outlines.

## 🌐 Live data & contact

- **GitHub activity** — the GitHub section fetches your real public repos and a contribution heatmap live (no API key; falls back gracefully if rate-limited/offline). Username is set in `src/lib/github.ts`.
- **Contact form** — posts to `src/app/api/contact/route.ts`. Set `RESEND_API_KEY` (free at [resend.com](https://resend.com)) to send real email. **Without a key it still works** — it falls back to opening the visitor's mail client. Includes a honeypot for spam.
- **OG share image** — `src/app/opengraph-image.tsx` generates a cyberpunk link-preview card automatically for both Open Graph and Twitter.
- **SEO** — `sitemap.ts`, `robots.ts`, JSON-LD, and per-route metadata.

## 🔑 Environment variables

Copy `.env.example` → `.env.local` (and set the same in Vercel):

| Var | Required | Purpose |
|-----|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for SEO/sitemap/OG |
| `RESEND_API_KEY` | optional | Enables real contact-form email |
| `CONTACT_FROM` | optional | Verified sender once you add a domain in Resend |

## 📦 Deploy

**Vercel (recommended):**

1. Push this folder to a GitHub repo (commit the generated `package-lock.json`).
2. Import the repo at [vercel.com/new](https://vercel.com/new) — it auto-detects Next.js.
3. Add the env vars above in the Vercel project settings.
4. Deploy. `vercel.json` already sets sensible security headers.

A **GitHub Actions** workflow (`.github/workflows/ci.yml`) type-checks, lints, and builds on every push/PR.

Any Node host also works with `npm run build && npm start`.

---

© Md Shagil Nizami · Bangalore, India
