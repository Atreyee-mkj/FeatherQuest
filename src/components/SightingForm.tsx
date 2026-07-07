import { useState, type ReactNode } from "react";

export interface SightingFormValues {
  birdName: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

export function SightingForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  extraContent,
}: {
  extraContent?: ReactNode;
  initial: SightingFormValues;
  submitLabel: string;
  onSubmit: (values: SightingFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<SightingFormValues>(initial);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SightingFormValues>(key: K, val: SightingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.birdName.trim()) return;
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-5">
      <Field label="Bird name">
        <input
          value={values.birdName}
          onChange={(e) => update("birdName", e.target.value)}
          placeholder="American Robin"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            value={values.time}
            onChange={(e) => update("time", e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>
      <Field label="Location (optional)">
        <input
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Backyard oak tree"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Behavior, weather, what caught your eye…"
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      {extraContent}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !values.birdName.trim()}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
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
