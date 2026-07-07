import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type MediaAsset } from "@/lib/db";
import { PhotoPicker, type PhotoItem } from "./PhotoPicker";
import { AudioRecorder, type AudioItem } from "./AudioRecorder";

export interface PendingMedia {
  photos: PhotoItem[];
  audios: AudioItem[];
}

export const emptyPendingMedia: PendingMedia = { photos: [], audios: [] };

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PendingMediaSection({
  value,
  onChange,
}: {
  value: PendingMedia;
  onChange: (v: PendingMedia) => void;
}) {
  return (
    <div className="space-y-4">
      <Section title="Photos">
        <PhotoPicker
          photos={value.photos}
          onAdd={(files) =>
            onChange({
              ...value,
              photos: [
                ...value.photos,
                ...files.map((f) => ({ key: newKey(), blob: f })),
              ],
            })
          }
          onRemove={(k) =>
            onChange({ ...value, photos: value.photos.filter((p) => p.key !== k) })
          }
        />
      </Section>
      <Section title="Audio">
        <AudioRecorder
          audios={value.audios}
          onAdd={(blob, mimeType) =>
            onChange({
              ...value,
              audios: [...value.audios, { key: newKey(), blob, mimeType }],
            })
          }
          onRemove={(k) =>
            onChange({ ...value, audios: value.audios.filter((a) => a.key !== k) })
          }
        />
      </Section>
    </div>
  );
}

export function LiveMediaSection({ sightingId }: { sightingId: number }) {
  const media =
    useLiveQuery<MediaAsset[]>(
      () =>
        db
          ? db.media.where("sightingId").equals(sightingId).sortBy("createdAt")
          : Promise.resolve([] as MediaAsset[]),
      [sightingId],
    ) ?? [];

  const photos = media
    .filter((m) => m.kind === "photo")
    .map((m) => ({ key: String(m.id), blob: m.blob }));
  const audios = media
    .filter((m) => m.kind === "audio")
    .map((m) => ({ key: String(m.id), blob: m.blob, mimeType: m.mimeType }));

  return (
    <div className="space-y-4">
      <Section title="Photos">
        <PhotoPicker
          photos={photos}
          onAdd={async (files) => {
            await db.media.bulkAdd(
              files.map((f) => ({
                sightingId,
                kind: "photo" as const,
                blob: f,
                mimeType: f.type || "image/jpeg",
                createdAt: Date.now(),
              })),
            );
          }}
          onRemove={async (k) => {
            await db.media.delete(Number(k));
          }}
        />
      </Section>
      <Section title="Audio">
        <AudioRecorder
          audios={audios}
          onAdd={async (blob, mimeType) => {
            await db.media.add({
              sightingId,
              kind: "audio",
              blob,
              mimeType,
              createdAt: Date.now(),
            });
          }}
          onRemove={async (k) => {
            await db.media.delete(Number(k));
          }}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
