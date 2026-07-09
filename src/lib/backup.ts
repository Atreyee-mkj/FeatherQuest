import JSZip from "jszip";
import { db } from "./db";

function extFromMime(mime: string, fallback: string) {
  const m = mime.split("/")[1]?.split(";")[0];
  return m ? m.replace("jpeg", "jpg") : fallback;
}

export async function exportBackup(): Promise<Blob> {
  if (!db) throw new Error("Database unavailable");
  const zip = new JSZip();

  const sightings = await db.sightings.toArray();
  const categories = await db.categories.toArray();
  const badges = await db.badges.toArray();
  const media = await db.media.toArray();

  const mediaManifest = media.map((m) => {
    const ext = extFromMime(m.mimeType, m.kind === "photo" ? "jpg" : "webm");
    const folder = m.kind === "photo" ? "photos" : "audio";
    const filename = `${folder}/sighting-${m.sightingId}-${m.id}.${ext}`;
    zip.file(filename, m.blob);
    return {
      id: m.id,
      sightingId: m.sightingId,
      kind: m.kind,
      mimeType: m.mimeType,
      createdAt: m.createdAt,
      file: filename,
    };
  });

  const manifest = {
    app: "FeatherQuest",
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      sightings: sightings.length,
      categories: categories.length,
      badges: badges.length,
      media: media.length,
    },
    sightings,
    categories,
    badges,
    media: mediaManifest,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file(
    "README.txt",
    "FeatherQuest backup archive.\n\n" +
      "Contents:\n" +
      "  manifest.json  — all sightings, categories, badges, and media metadata\n" +
      "  photos/        — photo attachments\n" +
      "  audio/         — voice recordings\n\n" +
      "Keep this file safe. It contains your full journal.\n",
  );

  return zip.generateAsync({ type: "blob" });
}

export async function downloadBackup() {
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `featherquest-backup-${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
