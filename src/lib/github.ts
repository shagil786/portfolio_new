/**
 * GitHub config + shared types.
 *
 * Data is fetched server-side via /api/github (cached hourly), so the browser
 * never hits GitHub directly — that avoids CORS and per-visitor rate limits.
 *
 * Multiple accounts are merged: list every PUBLIC username here (or override
 * with the GITHUB_USERNAMES env var, comma-separated). The first entry is the
 * "primary" used for profile links.
 *
 * NOTE: Yahoo work lives on an isolated GitHub Enterprise (EMU) tenant that the
 * public API can't reach, so it isn't fetched here — it's represented by the
 * curated "private contributions" tile (see `githubWork` in portfolioData).
 */

export const GITHUB_USERNAMES: string[] = (
  process.env.GITHUB_USERNAMES || "shagil786"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Primary account — used for profile links / @handle display. */
export const GITHUB_USERNAME = GITHUB_USERNAMES[0];

export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string;
  fork: boolean;
  owner?: { login: string };
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  total: number;
  weeks: ContributionDay[][];
}

export interface GitHubPayload {
  repos: (Repo & { account?: string })[] | null;
  contributions: ContributionData | null;
  usernames: string[];
}
