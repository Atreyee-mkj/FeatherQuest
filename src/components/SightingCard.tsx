import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useObjectUrl } from "@/hooks/use-object-url";
import { db, type Sighting, type MediaAsset, type Category } from "@/lib/db";
import { Feather, Star, Mic, Image as ImageIcon } from "lucide-react";

export function SightingCard({
  sighting: s,
  category,
}: {
  sighting: Sighting;
  category?: Category;
}) {
  const media =
    useLiveQuery<MediaAsset[]>(
      () =>
        db && s.id
          ? db.media.where("sightingId").equals(s.id).toArray()
          : Promise.resolve([] as MediaAsset[]),
      [s.id],
    ) ?? [];
  const firstPhoto = media.find((m) => m.kind === "photo");
  const photoCount = media.filter((m) => m.kind === "photo").length;
  const audioCount = media.filter((m) => m.kind === "audio").length;
  const thumbUrl = useObjectUrl(firstPhoto?.blob);

  return (
    <Link
      to="/sighting/$id"
      params={{ id: String(s.id) }}
      className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Feather className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold">{s.birdName}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {s.date} · {s.time}
              {s.location ? ` · ${s.location}` : ""}
            </p>
          </div>
          {s.favorite && <Star className="h-4 w-4 flex-shrink-0 fill-accent text-accent" />}
        </div>
        {s.notes && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.notes}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: `${category.color}22`, color: category.color }}
            >
              <span aria-hidden>{category.icon}</span> {category.name}
            </span>
          )}
          {photoCount > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> {photoCount}
            </span>
          )}
          {audioCount > 0 && (
            <span className="flex items-center gap-1">
              <Mic className="h-3 w-3" /> {audioCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
