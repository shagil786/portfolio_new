import { NextResponse } from "next/server";
import {
  GITHUB_USERNAMES,
  type Repo,
  type ContributionData,
  type ContributionDay,
} from "@/lib/github";

export const runtime = "nodejs";
// Run every request so env changes apply immediately; upstream GitHub calls are
// still cached for an hour via fetch(), so we never spam GitHub.
export const dynamic = "force-dynamic";

const TOKEN = process.env.GITHUB_TOKEN?.trim();

function levelFromCount(c: number): 0 | 1 | 2 | 3 | 4 {
  if (c <= 0) return 0;
  if (c < 3) return 1;
  if (c < 6) return 2;
  if (c < 10) return 3;
  return 4;
}

async function reposFor(user: string): Promise<(Repo & { account: string })[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "msn-os-portfolio",
    };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data: Repo[] = await res.json();
    return data.filter((r) => !r.fork).map((r) => ({ ...r, account: user }));
  } catch {
    return [];
  }
}

/** Contribution calendar; includes the token owner's private contributions. */
async function contributionsGraphQL(user: string): Promise<Record<string, number>> {
  if (!TOKEN) return {};
  try {
    const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "msn-os-portfolio",
      },
      body: JSON.stringify({ query, variables: { login: user } }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const weeks =
      json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
    const map: Record<string, number> = {};
    weeks.forEach((w: any) =>
      w.contributionDays.forEach((d: any) => {
        map[d.date] = (map[d.date] ?? 0) + (d.contributionCount ?? 0);
      })
    );
    return map;
  } catch {
    return {};
  }
}

/** Public fallback (no token): the public profile calendar via a free proxy. */
async function contributionsPublic(user: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return {};
    const json = await res.json();
    const map: Record<string, number> = {};
    (json.contributions ?? []).forEach((d: any) => {
      map[d.date] = (map[d.date] ?? 0) + (d.count ?? 0);
    });
    return map;
  } catch {
    return {};
  }
}

function buildContributionData(merged: Record<string, number>): ContributionData | null {
  const dates = Object.keys(merged).sort();
  if (!dates.length) return null;
  const days: ContributionDay[] = dates.map((date) => ({
    date,
    count: merged[date],
    level: levelFromCount(merged[date]),
  }));
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];
  days.forEach((day) => {
    const weekday = new Date(day.date).getUTCDay();
    if (weekday === 0 && week.length) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });
  if (week.length) weeks.push(week);
  const total = days.reduce((a, d) => a + d.count, 0);
  return { total, weeks: weeks.slice(-53) };
}

export async function GET() {
  const repoLists = await Promise.all(GITHUB_USERNAMES.map(reposFor));
  const allRepos = repoLists
    .flat()
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        +new Date(b.updated_at) - +new Date(a.updated_at)
    )
    .slice(0, 9);

  const maps = await Promise.all(
    GITHUB_USERNAMES.map((u) => (TOKEN ? contributionsGraphQL(u) : contributionsPublic(u)))
  );
  const merged: Record<string, number> = {};
  maps.forEach((m) =>
    Object.entries(m).forEach(([date, count]) => {
      merged[date] = (merged[date] ?? 0) + count;
    })
  );

  return NextResponse.json(
    {
      repos: allRepos.length ? allRepos : null,
      contributions: buildContributionData(merged),
      usernames: GITHUB_USERNAMES,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
