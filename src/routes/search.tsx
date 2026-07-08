import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { AppShell, EmptyState, PageHeader } from "@/components/AppShell";
import { SightingCard } from "@/components/SightingCard";
import { db, type Sighting, type MediaAsset, type Category } from "@/lib/db";
import { Search as SearchIcon, Star, Mic, Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — FeatherQuest" }] }),
  component: SearchPage,
});

type MediaFilter = "all" | "photos" | "audio";

function SearchPage() {
  const [q, setQ] = useState("");
  const [media, setMedia] = useState<MediaFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [categoryId, setCategoryId] = useState<number | "all">("all");

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
    if (categoryId !== "all" && s.categoryId !== categoryId) return false;
    const counts = s.id ? mediaBySighting.get(s.id) : undefined;
    if (media === "photos" && !(counts && counts.photos > 0)) return false;
    if (media === "audio" && !(counts && counts.audios > 0)) return false;
    if (query) {
      const hay = `${s.birdName} ${s.notes ?? ""} ${s.date} ${s.location ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const hasActive =
    query || media !== "all" || favoritesOnly || categoryId !== "all";

  return (
    <AppShell>
      <PageHeader title="Search" subtitle="Find birds, notes, or dates" />
      <div className="space-y-3 px-5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
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
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={categoryId === "all"} onClick={() => setCategoryId("all")}>
              All categories
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={categoryId === c.id}
                onClick={() => setCategoryId(categoryId === c.id ? "all" : c.id!)}
              >
                <span aria-hidden>{c.icon}</span> {c.name}
              </FilterChip>
            ))}
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
