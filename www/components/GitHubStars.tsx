import { useEffect, useState } from "react";

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
  >
    <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Z" />
  </svg>
);

const formatStars = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cacheKey = (repo: string) => `mockbin:gh-stars:${repo}`;

type CacheEntry = { count: number; fetchedAt: number };

const readCache = (repo: string): CacheEntry | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(repo));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (
      typeof parsed?.count !== "number" ||
      typeof parsed?.fetchedAt !== "number"
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (repo: string, count: number) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      cacheKey(repo),
      JSON.stringify({ count, fetchedAt: Date.now() }),
    );
  } catch {
    // localStorage full / disabled — silently skip cache
  }
};

const GitHubStars = ({ repo }: { repo: string }) => {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const cached = readCache(repo);
    if (cached) {
      setStars(cached.count);
      if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return;
      }
    }

    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
          writeCache(repo, data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return (
    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-bg-muted text-fg text-[12px] font-semibold tabular-nums">
      <StarIcon />
      {stars === null ? "—" : formatStars(stars)}
    </span>
  );
};

export default GitHubStars;
