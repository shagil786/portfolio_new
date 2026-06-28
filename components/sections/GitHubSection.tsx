"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GitHubPayload, Repo } from "@/lib/github";
import { links, githubWork } from "@/data/portfolioData";

const LEVEL_BG = ["bg-white/5", "bg-neon/25", "bg-neon/45", "bg-neon/70", "bg-neon"];

type RepoWithAccount = Repo & { account?: string };

export default function GitHubSection() {
  const [data, setData] = useState<GitHubPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use an "ignore" flag rather than AbortController: in React dev Strict
    // Mode the effect runs twice, and aborting would cancel the live request
    // (it works via curl but shows "(canceled)" in the app). This just drops
    // stale results from the first run instead.
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`/api/github?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`status ${r.status}`);
        const d: GitHubPayload = await r.json();
        if (!ignore) setData(d);
      } catch {
        /* leave data null → fallback UI renders */
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const repos = (data?.repos as RepoWithAccount[]) ?? null;
  const contrib = data?.contributions ?? null;
  const usernames = data?.usernames ?? [];
  const multi = usernames.length > 1;

  return (
    <section
      id="github"
      className="relative mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-neon2/80">
            <span className="rounded border border-neon/40 px-2 py-0.5 text-neon">
              LIVE FEED
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-neon/50 to-transparent" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            <span className="neon-text">GitHub Activity</span>
          </h2>
          <p className="max-w-2xl text-sm text-ink/60 md:text-base">
            {multi ? "Merged live from " : "Pulled live from "}
            {usernames.length
              ? usernames.map((u, i) => (
                  <span key={u}>
                    <a
                      href={`https://github.com/${u}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon hover:underline"
                    >
                      @{u}
                    </a>
                    {i < usernames.length - 1 ? " + " : ""}
                  </span>
                ))
              : "GitHub"}
            . Real repos, real commits.
          </p>
        </div>

        {/* curated private (enterprise) work tile */}
        <div className="glass mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border-neon/30 p-4 md:p-5">
          <span className="text-lg text-neon">🔒</span>
          <span className="font-display text-2xl font-bold neon-text">
            {githubWork.privateContributions.toLocaleString()}+
          </span>
          <span className="text-sm text-ink/80">
            private contributions on{" "}
            <span className="text-neon2">{githubWork.label}</span>
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-ink/40">
            {githubWork.note}
          </span>
        </div>

        {/* contribution heatmap */}
        <div className="glass mb-6 overflow-hidden rounded-xl p-4 md:p-5">
          {contrib ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-ink/60">
                  {contrib.total.toLocaleString()} contributions in the last year
                  {multi ? " (combined)" : ""}
                </span>
                <div className="hidden items-center gap-1 font-mono text-[10px] text-ink/40 sm:flex">
                  less
                  {LEVEL_BG.map((bg, i) => (
                    <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${bg}`} />
                  ))}
                  more
                </div>
              </div>
              <div className="flex gap-[3px] overflow-x-auto pb-1">
                {contrib.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <span
                        key={day.date}
                        title={`${day.count} on ${day.date}`}
                        className={`h-2.5 w-2.5 rounded-[2px] ${LEVEL_BG[day.level]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : loading ? (
            <div className="flex h-20 items-center justify-center font-mono text-xs text-ink/40">
              <span className="animate-pulse">fetching contribution graph…</span>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center font-mono text-xs text-ink/40">
              contribution graph unavailable —
              <a href={links.github} target="_blank" rel="noopener noreferrer" className="ml-1 text-neon hover:underline">
                view on GitHub →
              </a>
            </div>
          )}
        </div>

        {/* repo cards */}
        {repos && repos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.06 }}
                className="glass group flex flex-col rounded-xl p-4 transition hover:border-neon/50 hover:shadow-neon-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-neon">▣</span>
                  <h3 className="truncate font-display text-sm font-bold text-ink group-hover:neon-text">
                    {repo.name}
                  </h3>
                </div>
                <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-ink/55">
                  {repo.description ?? "No description provided."}
                </p>
                <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-ink/50">
                  {repo.language && <span className="text-neon2">● {repo.language}</span>}
                  <span>★ {repo.stargazers_count}</span>
                  <span>⑂ {repo.forks_count}</span>
                  {multi && repo.account && (
                    <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-ink/40">
                      @{repo.account}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        ) : loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-28 animate-pulse rounded-xl opacity-50" />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-6 text-center font-mono text-xs text-ink/50">
            Couldn&apos;t load repos right now.{" "}
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline">
              Browse them on GitHub →
            </a>
          </div>
        )}
      </motion.div>
    </section>
  );
}
