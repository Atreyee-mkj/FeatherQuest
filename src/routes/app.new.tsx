import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SightingForm } from "@/components/SightingForm";
import {
  PendingMediaSection,
  emptyPendingMedia,
  type PendingMedia,
} from "@/components/media/MediaSection";
import { db } from "@/lib/db";

export const Route = createFileRoute("/app/new")({
  head: () => ({ meta: [{ title: "New sighting — FeatherQuest" }] }),
  component: NewSighting,
});

function NewSighting() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingMedia>(emptyPendingMedia);
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
          behaviors: [],
        }}
        submitLabel="Save sighting"
        onCancel={() => navigate({ to: "/" })}
        extraContent={<PendingMediaSection value={pending} onChange={setPending} />}
        onSubmit={async (v) => {
          const weather =
            v.weatherCondition || v.weatherTempC != null
              ? { condition: v.weatherCondition, tempC: v.weatherTempC }
              : undefined;
          const id = await db.sightings.add({
            birdName: v.birdName.trim(),
            date: v.date,
            time: v.time,
            location: v.location.trim() || undefined,
            notes: v.notes.trim() || undefined,
            categoryId: v.categoryId,
            favorite: false,
            createdAt: Date.now(),
            mood: v.mood,
            rarity: v.rarity,
            behaviors: v.behaviors.length ? v.behaviors : undefined,
            weather,
            count: v.count && v.count > 1 ? v.count : undefined,
          });

          if (pending.photos.length || pending.audios.length) {
            await db.media.bulkAdd([
              ...pending.photos.map((p) => ({
                sightingId: id,
                kind: "photo" as const,
                blob: p.blob,
                mimeType: p.blob.type || "image/jpeg",
                createdAt: Date.now(),
              })),
              ...pending.audios.map((a) => ({
                sightingId: id,
                kind: "audio" as const,
                blob: a.blob,
                mimeType: a.mimeType,
                createdAt: Date.now(),
              })),
            ]);
          }
          navigate({ to: "/" });
        }}
      />
    </AppShell>
  );
}
