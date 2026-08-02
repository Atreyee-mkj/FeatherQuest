import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { AppShell, EmptyState, PageHeader } from "@/components/AppShell";
import { SightingCard } from "@/components/SightingCard";
import { db, type Sighting, type MediaAsset, type Category } from "@/lib/db";
import { BEHAVIORS, WEATHER_CONDITIONS } from "@/lib/journal-meta";
import {
  Search as SearchIcon,
  Star,
  Mic,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/app/search")({
  head: () => ({ meta: [{ title: "Search — FeatherQuest" }] }),
  component: SearchPage,
});

type MediaFilter = "all" | "photos" | "audio";

function SearchPage() {
  const [q, setQ] = useState("");
  const [media, setMedia] = useState<MediaFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [categoryIds, setCategoryIds] = useState<Set<number>>(new Set());
  const [behaviors, setBehaviors] = useState<Set<string>>(new Set());
  const [weather, setWeather] = useState<Set<string>>(new Set());
  const [minCount, setMinCount] = useState<0 | 2 | 5 | 10>(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [advOpen, setAdvOpen] = useState(false);

  const sightings =
    useLiveQuery<Sighting[]>(
      () =>
        db
          ? db.sightings.orderBy("createdAt").reverse().toArray()
          : Promise.resolve([] as Sighting[]),
      [],
    ) ?? [];
  const categories =
    useLiveQuery<Category[]>(
      () => (db ? db.categories.toArray() : Promise.resolve([] as Category[])),
      [],
    ) ?? [];
  const allMedia =
    useLiveQuery<MediaAsset[]>(
      () => (db ? db.media.toArray() : Promise.resolve([] as MediaAsset[])),
      [],
    ) ?? [];

  const catById = useMemo(() => new Map(categories.map((c) => [c.id!, c])), [categories]);
  const mediaBySighting = useMemo(() => {
    const map = new Map<number, { photos: number; audios: number }>();
    for (const m of allMedia) {
      const entry = map.get(m.sightingId) ?? { photos: 0, audios: 0 };
      if (m.kind === "photo") entry.photos++;
      else entry.audios++;
      map.set(m.sightingId, entry);
    }
    return map;
  }, [allMedia]);

  const query = q.trim().toLowerCase();
  const filtered = sightings.filter((s) => {
    if (favoritesOnly && !s.favorite) return false;
    if (categoryIds.size > 0 && (!s.categoryId || !categoryIds.has(s.categoryId))) return false;
    const counts = s.id ? mediaBySighting.get(s.id) : undefined;
    if (media === "photos" && !(counts && counts.photos > 0)) return false;
    if (media === "audio" && !(counts && counts.audios > 0)) return false;
    if (behaviors.size > 0) {
      const sb = s.behaviors ?? [];
      if (!sb.some((b) => behaviors.has(b))) return false;
    }
    if (weather.size > 0) {
      if (!s.weather?.condition || !weather.has(s.weather.condition)) return false;
    }
    if (minCount > 0 && (s.count ?? 1) < minCount) return false;
    if (fromDate && s.date < fromDate) return false;
    if (toDate && s.date > toDate) return false;
    if (query) {
      const hay = `${s.birdName} ${s.notes ?? ""} ${s.date} ${s.location ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const advCount =
    categoryIds.size +
    behaviors.size +
    weather.size +
    (minCount > 0 ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  const hasActive =
    query || media !== "all" || favoritesOnly || advCount > 0;

  function clearAll() {
    setQ("");
    setMedia("all");
    setFavoritesOnly(false);
    setCategoryIds(new Set());
    setBehaviors(new Set());
    setWeather(new Set());
    setMinCount(0);
    setFromDate("");
    setToDate("");
  }

  function toggleIn<T>(set: Set<T>, v: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  }

  return (
    <AppShell>
      <PageHeader title="Search" subtitle="Find birds, notes, or dates" />
      <div className="space-y-3 px-5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bird, notes, date…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={media === "photos"} onClick={() => setMedia(media === "photos" ? "all" : "photos")}>
            <ImageIcon className="h-3.5 w-3.5" /> Photos
          </FilterChip>
          <FilterChip active={media === "audio"} onClick={() => setMedia(media === "audio" ? "all" : "audio")}>
            <Mic className="h-3.5 w-3.5" /> Audio
          </FilterChip>
          <FilterChip active={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
            <Star className="h-3.5 w-3.5" /> Favorites
          </FilterChip>
          <FilterChip active={advOpen} onClick={() => setAdvOpen((v) => !v)}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> More
            {advCount > 0 && (
              <span className="ml-1 rounded-full bg-background/30 px-1.5 text-[10px]">
                {advCount}
              </span>
            )}
          </FilterChip>
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-muted-foreground underline"
            >
              Clear all
            </button>
          )}
        </div>

        {advOpen && (
          <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-3 animate-fade-in">
            {categories.length > 0 && (
              <FilterGroup label="Habitat">
                {categories.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={categoryIds.has(c.id!)}
                    onClick={() =>
                      toggleIn(categoryIds, c.id!, setCategoryIds)
                    }
                  >
                    <span aria-hidden>{c.icon}</span> {c.name}
                  </FilterChip>
                ))}
              </FilterGroup>
            )}
            <FilterGroup label="Behavior">
              {BEHAVIORS.map((b) => (
                <FilterChip
                  key={b.id}
                  active={behaviors.has(b.id)}
                  onClick={() => toggleIn(behaviors, b.id, setBehaviors)}
                >
                  <span aria-hidden>{b.emoji}</span> {b.label}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Weather">
              {WEATHER_CONDITIONS.map((w) => (
                <FilterChip
                  key={w.id}
                  active={weather.has(w.id)}
                  onClick={() => toggleIn(weather, w.id, setWeather)}
                >
                  <span aria-hidden>{w.emoji}</span> {w.label}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Number observed">
              {[
                { v: 0, label: "Any" },
                { v: 2, label: "2+" },
                { v: 5, label: "5+" },
                { v: 10, label: "10+" },
              ].map((o) => (
                <FilterChip
                  key={o.v}
                  active={minCount === o.v}
                  onClick={() => setMinCount(o.v as 0 | 2 | 5 | 10)}
                >
                  {o.label}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Date range">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
              />
              <span className="self-center text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
              />
            </FilterGroup>
          </div>
        )}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={hasActive ? "No matches" : "Start typing"}
            description={
              hasActive
                ? "Try loosening filters or clearing your search."
                : "Search across every sighting in your journal."
            }
          />
        ) : (
          <ul className="space-y-3 px-5">
            {filtered.map((s) => (
              <li key={s.id}>
                <SightingCard
                  sighting={s}
                  category={s.categoryId ? catById.get(s.categoryId) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
