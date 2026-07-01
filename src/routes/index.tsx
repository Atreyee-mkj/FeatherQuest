import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell, EmptyState, PageHeader } from "@/components/AppShell";
import { db } from "@/lib/db";
import { Feather, Star, Mic, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FeatherQuest — Your Bird Journal" },
      { name: "description", content: "A private, offline-first journal for your bird sightings." },
    ],
  }),
  component: Home,
});

function Home() {
  const sightings = useLiveQuery(
    () => (db ? db.sightings.orderBy("createdAt").reverse().toArray() : Promise.resolve([])),
    [],
  ) ?? [];

  return (
    <AppShell>
      <PageHeader title="Field Journal" subtitle="Your recent sightings" />
      {sightings.length === 0 ? (
        <EmptyState
          icon={<Feather className="mx-auto h-10 w-10 text-primary" />}
          title="No sightings yet"
          description="Tap the + button to log your first bird. Your journal lives here."
        />
      ) : (
        <ul className="space-y-3 px-5">
          {sightings.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">{s.birdName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {s.date} · {s.time}
                    {s.location ? ` · ${s.location}` : ""}
                  </p>
                </div>
                {s.favorite && <Star className="h-4 w-4 fill-accent text-accent" />}
              </div>
              {s.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.notes}</p>
              )}
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> photos</span>
                <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> audio</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
