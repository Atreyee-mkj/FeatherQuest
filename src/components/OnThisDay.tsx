import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Sighting, type MediaAsset } from "@/lib/db";
import { useObjectUrl } from "@/hooks/use-object-url";
import { Feather } from "lucide-react";

export function OnThisDay() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const currentYear = today.getFullYear();

  const memories =
    useLiveQuery<Sighting[]>(async () => {
      if (!db) return [];
      const all = await db.sightings.toArray();
      return all
        .filter((s) => {
          const parts = s.date.split("-");
          if (parts.length !== 3) return false;
          const [y, m, d] = parts;
          return (
            m === mm && d === dd && Number(y) < currentYear
          );
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }, [mm, dd, currentYear]) ?? [];

  if (memories.length === 0) return null;

  return (
    <section className="mb-4 animate-fade-in">
      <div className="mb-2 flex items-center justify-between px-5">
        <h2 className="font-display text-base font-semibold">On this day</h2>
        <span className="text-xs text-muted-foreground">
          {memories.length} {memories.length === 1 ? "memory" : "memories"}
        </span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1">
        {memories.map((s) => (
          <MemoryCard key={s.id} sighting={s} />
        ))}
      </div>
    </section>
  );
}

function MemoryCard({ sighting }: { sighting: Sighting }) {
  const photo = useLiveQuery<MediaAsset | undefined>(
    () =>
      db && sighting.id
        ? db.media.where("sightingId").equals(sighting.id).and((m) => m.kind === "photo").first()
        : Promise.resolve(undefined),
    [sighting.id],
  );
  const url = useObjectUrl(photo?.blob);
  const yearsAgo = new Date().getFullYear() - Number(sighting.date.slice(0, 4));

  return (
    <Link
      to="/app/sighting/$id"
      params={{ id: String(sighting.id) }}
      className="flex w-40 flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="aspect-[4/3] w-full bg-muted">
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Feather className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 p-2.5">
        <p className="truncate font-display text-sm font-semibold">{sighting.birdName}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {yearsAgo === 0
            ? "Earlier today"
            : yearsAgo === 1
              ? "1 year ago"
              : `${yearsAgo} years ago`}
        </p>
        {sighting.notes && (
          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
            {sighting.notes}
          </p>
        )}
      </div>
    </Link>
  );
}
