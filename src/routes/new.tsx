import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SightingForm } from "@/components/SightingForm";
import { db } from "@/lib/db";

export const Route = createFileRoute("/new")({
  head: () => ({ meta: [{ title: "New sighting — FeatherQuest" }] }),
  component: NewSighting,
});

function NewSighting() {
  const navigate = useNavigate();
  const now = new Date();

  return (
    <AppShell>
      <PageHeader title="New sighting" subtitle="Quick capture — takes seconds" />
      <SightingForm
        initial={{
          birdName: "",
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 5),
          location: "",
          notes: "",
        }}
        submitLabel="Save sighting"
        onCancel={() => navigate({ to: "/" })}
        onSubmit={async (v) => {
          await db.sightings.add({
            birdName: v.birdName.trim(),
            date: v.date,
            time: v.time,
            location: v.location.trim() || undefined,
            notes: v.notes.trim() || undefined,
            favorite: false,
            createdAt: Date.now(),
          });
          navigate({ to: "/" });
        }}
      />
      <p className="mt-4 px-5 pb-4 text-center text-xs text-muted-foreground">
        Photos and audio recording come online in Phase 4.
      </p>
    </AppShell>
  );
}
