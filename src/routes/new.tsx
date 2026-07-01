import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { db } from "@/lib/db";
import { useState } from "react";

export const Route = createFileRoute("/new")({
  head: () => ({ meta: [{ title: "New sighting — FeatherQuest" }] }),
  component: NewSighting,
});

function NewSighting() {
  const navigate = useNavigate();
  const now = new Date();
  const [birdName, setBirdName] = useState("");
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!birdName.trim()) return;
    setSaving(true);
    await db.sightings.add({
      birdName: birdName.trim(),
      date,
      time,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      favorite: false,
      createdAt: Date.now(),
    });
    setSaving(false);
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <PageHeader title="New sighting" subtitle="Quick capture — takes seconds" />
      <form onSubmit={save} className="space-y-4 px-5">
        <Field label="Bird name">
          <input
            value={birdName}
            onChange={(e) => setBirdName(e.target.value)}
            placeholder="American Robin"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
        <Field label="Location (optional)">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Backyard oak tree"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Behavior, weather, what caught your eye…"
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <button
          type="submit"
          disabled={saving || !birdName.trim()}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save sighting"}
        </button>
        <p className="pb-4 text-center text-xs text-muted-foreground">
          Photos and audio recording come online in Phase 4.
        </p>
      </form>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
