import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Loader2, Share2, X } from "lucide-react";
import { db, type Badge, type Profile } from "@/lib/db";
import { BADGES } from "@/lib/badges";
import { computeRichStats } from "@/lib/stats";
import { useObjectUrl } from "@/hooks/use-object-url";

export function ShareCardDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile | undefined;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useLiveQuery(() => computeRichStats(), []);
  const badges =
    useLiveQuery<Badge[]>(
      () => (db ? db.badges.toArray() : Promise.resolve([] as Badge[])),
      [],
    ) ?? [];
  const speciesCount =
    useLiveQuery(async () => {
      if (!db) return 0;
      const all = await db.sightings.toArray();
      return new Set(all.map((s) => s.birdName.trim().toLowerCase()).filter(Boolean))
        .size;
    }, []) ?? 0;
  const photoCount =
    useLiveQuery(() => (db ? db.media.where("kind").equals("photo").count() : Promise.resolve(0)), []) ?? 0;
  const audioCount =
    useLiveQuery(() => (db ? db.media.where("kind").equals("audio").count() : Promise.resolve(0)), []) ?? 0;

  const avatarUrl = useObjectUrl(profile?.avatarBlob);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  if (!open) return null;

  const unlocked = BADGES.filter((b) => badges.find((x) => x.id === b.id)?.unlocked);
  const displayBadges = unlocked.slice(0, 8);
  const moreBadges = Math.max(0, unlocked.length - displayBadges.length);

  async function render(): Promise<Blob | null> {
    const node = cardRef.current;
    if (!node) return null;
    try {
      await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
    } catch {
      /* fonts API unavailable */
    }
    const options = {
      // Google Fonts CSS is cross-origin; embedding it throws and kills the render.
      skipFonts: true,
      cacheBust: false,
      pixelRatio: 2,
      width: 360,
      backgroundColor: "#0f2418",
    } as const;
    // First pass warms image decoding; the second produces a complete frame.
    await toPng(node, options);
    const dataUrl = await toPng(node, options);
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      const blob = await render();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `featherquest-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not render card");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    setError(null);
    try {
      const blob = await render();
      if (!blob) return;
      const file = new File([blob], "featherquest-stats.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (typeof navigator.share === "function" && nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My FeatherQuest journey",
          text: "My birdwatching stats from FeatherQuest 🪶",
        });
      } else {
        await handleDownload();
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Share failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-3xl bg-card p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Share your journey</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Rendered card */}
        <div className="overflow-hidden rounded-2xl">
          <div
            ref={cardRef}
            style={{
              width: 360,
              padding: 24,
              background:
                "linear-gradient(160deg, #1a3c2a 0%, #0f2418 60%, #2d5a3d 100%)",
              color: "#f5f0e0",
              fontFamily: "'Nunito Sans', system-ui, sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span>🪶</span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Lora', serif" }}>
                  {profile?.displayName || "Birdwatcher"}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>FeatherQuest journal</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <StatBoxSSR label="Sightings" value={stats?.totalObservations ?? 0} />
              <StatBoxSSR label="Species" value={speciesCount} />
              <StatBoxSSR label="Photos" value={photoCount} />
              <StatBoxSSR label="Recordings" value={audioCount} />
              <StatBoxSSR label="Current streak" value={`${stats?.currentStreak ?? 0}d`} />
              <StatBoxSSR label="Longest streak" value={`${stats?.longestStreak ?? 0}d`} />
            </div>

            {displayBadges.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 10, letterSpacing: 1, opacity: 0.7, textTransform: "uppercase" }}>
                  Badges
                </div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {displayBadges.map((b) => (
                    <div
                      key={b.id}
                      title={b.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {b.icon}
                    </div>
                  ))}
                  {moreBadges > 0 && (
                    <div
                      style={{
                        minWidth: 36,
                        height: 36,
                        padding: "0 8px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      +{moreBadges}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 11,
                opacity: 0.75,
              }}
            >
              <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 13 }}>
                🪶 FeatherQuest
              </span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Save
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBoxSSR({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Lora', serif" }}>{value}</div>
      <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </div>
    </div>
  );
}
