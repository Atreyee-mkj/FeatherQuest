import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell, EmptyState, PageHeader } from "@/components/AppShell";
import { SightingCard } from "@/components/SightingCard";
import { db, type Sighting, type Category } from "@/lib/db";
import { Feather } from "lucide-react";

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
  const sightings: Sighting[] =
    useLiveQuery(
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
  const catById = new Map(categories.map((c) => [c.id!, c]));

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
            <li key={s.id}>
              <SightingCard
                sighting={s}
                category={s.categoryId ? catById.get(s.categoryId) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

