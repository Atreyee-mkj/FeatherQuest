import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SightingForm } from "@/components/SightingForm";
import { LiveMediaSection } from "@/components/media/MediaSection";
import { db, type Sighting } from "@/lib/db";
import { behaviorOf, moodOf, rarityOf, weatherOf } from "@/lib/journal-meta";
import { ArrowLeft, Pencil, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/sighting/$id")({
  head: () => ({ meta: [{ title: "Sighting — FeatherQuest" }] }),
  component: SightingDetail,
  notFoundComponent: () => (
    <AppShell>
      <PageHeader title="Not found" subtitle="This sighting no longer exists" />
      <div className="px-5">
        <Link to="/" className="text-sm text-primary underline">
          Back to journal
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <PageHeader title="Something went wrong" subtitle={error.message} />
    </AppShell>
  ),
});

function SightingDetail() {
  const { id } = Route.useParams();
  const sightingId = Number(id);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sighting = useLiveQuery<Sighting | undefined>(
    () => (db ? db.sightings.get(sightingId) : Promise.resolve(undefined)),
    [sightingId],
  );

  if (sighting === undefined) {
    return (
      <AppShell>
        <PageHeader title="Loading…" />
      </AppShell>
    );
  }

  if (sighting === null || !sighting) {
    return (
      <AppShell>
        <PageHeader title="Not found" subtitle="This sighting no longer exists" />
        <div className="px-5">
          <Link to="/" className="text-sm text-primary underline">
            Back to journal
          </Link>
        </div>
      </AppShell>
    );
  }

  async function toggleFavorite() {
    if (!sighting?.id) return;
    await db.sightings.update(sighting.id, { favorite: !sighting.favorite });
  }

  async function handleDelete() {
    if (!sighting?.id) return;
    await db.media.where("sightingId").equals(sighting.id).delete();
    await db.sightings.delete(sighting.id);
    navigate({ to: "/" });
  }

  if (editing) {
    return (
      <AppShell>
        <PageHeader title="Edit sighting" subtitle={sighting.birdName} />
        <SightingForm
          initial={{
            birdName: sighting.birdName,
            date: sighting.date,
            time: sighting.time,
            location: sighting.location ?? "",
            notes: sighting.notes ?? "",
            categoryId: sighting.categoryId,
            mood: sighting.mood,
            rarity: sighting.rarity,
            behaviors: sighting.behaviors ?? [],
            weatherCondition: sighting.weather?.condition,
            weatherTempC: sighting.weather?.tempC,
          }}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (v) => {
            const weather =
              v.weatherCondition || v.weatherTempC != null
                ? { condition: v.weatherCondition, tempC: v.weatherTempC }
                : undefined;
            await db.sightings.update(sightingId, {
              birdName: v.birdName.trim(),
              date: v.date,
              time: v.time,
              location: v.location.trim() || undefined,
              notes: v.notes.trim() || undefined,
              categoryId: v.categoryId,
              mood: v.mood,
              rarity: v.rarity,
              behaviors: v.behaviors.length ? v.behaviors : undefined,
              weather,
            });
            setEditing(false);
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between px-5 pt-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Journal
        </Link>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={sighting.favorite ? "Remove favorite" : "Mark favorite"}
          className="rounded-full p-2"
        >
          <Star
            className={`h-5 w-5 ${sighting.favorite ? "fill-accent text-accent" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <div className="px-5 pt-2">
        <h1 className="font-display text-3xl font-semibold leading-tight">{sighting.birdName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sighting.date} · {sighting.time}
          {sighting.location ? ` · ${sighting.location}` : ""}
        </p>
      </div>

      <JournalMeta sighting={sighting} />

      {sighting.notes && (
        <div className="mx-5 mt-5 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{sighting.notes}</p>
        </div>
      )}

      <div className="mx-5 mt-5">
        <LiveMediaSection sightingId={sightingId} />
      </div>



      <div className="mt-6 flex gap-2 px-5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5" onClick={() => setConfirmDelete(false)}>
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold">Delete this sighting?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This removes {sighting.birdName} from your journal. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-full border border-border py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function JournalMeta({ sighting }: { sighting: Sighting }) {
  const mood = moodOf(sighting.mood);
  const rarity = rarityOf(sighting.rarity);
  const weather = weatherOf(sighting.weather?.condition);
  const tempC = sighting.weather?.tempC;
  const behaviors = (sighting.behaviors ?? [])
    .map((id) => behaviorOf(id))
    .filter((b): b is NonNullable<typeof b> => !!b);
  const hasAny =
    mood || rarity || weather || tempC != null || behaviors.length > 0;
  if (!hasAny) return null;

  return (
    <div className="mx-5 mt-5 space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {rarity && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              rarity.id === "lifer"
                ? "bg-accent text-accent-foreground shadow shadow-accent/30"
                : "bg-muted text-foreground"
            }`}
          >
            {rarity.label}
          </span>
        )}
        {mood && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            <span aria-hidden>{mood.emoji}</span> {mood.label}
          </span>
        )}
        {(weather || tempC != null) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            {weather && (
              <>
                <span aria-hidden>{weather.emoji}</span> {weather.label}
              </>
            )}
            {tempC != null && <span>· {tempC}°C</span>}
          </span>
        )}
      </div>
      {behaviors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {behaviors.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
            >
              <span aria-hidden>{b.emoji}</span> {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
