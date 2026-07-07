import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { useObjectUrl } from "@/hooks/use-object-url";

export interface AudioItem {
  key: string;
  blob: Blob;
  mimeType: string;
}

export function AudioRecorder({
  audios,
  onAdd,
  onRemove,
}: {
  audios: AudioItem[];
  onAdd: (blob: Blob, mimeType: string) => void;
  onRemove: (key: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const type = mr.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        onAdd(blob, type);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      alert("Microphone permission denied or unavailable.");
    }
  }

  function stop() {
    mrRef.current?.stop();
    mrRef.current = null;
    setRecording(false);
    stopTimer();
  }

  useEffect(() => {
    return () => {
      stopTimer();
      try {
        mrRef.current?.stop();
      } catch {
        // ignore
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-2">
      {!recording ? (
        <button
          type="button"
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold"
        >
          <Mic className="h-4 w-4" /> Record audio
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground"
        >
          <Square className="h-4 w-4" /> Stop · {formatTime(elapsed)}
        </button>
      )}
      {audios.map((a, i) => (
        <AudioRow key={a.key} item={a} index={i + 1} onRemove={() => onRemove(a.key)} />
      ))}
    </div>
  );
}

function AudioRow({
  item,
  index,
  onRemove,
}: {
  item: AudioItem;
  index: number;
  onRemove: () => void;
}) {
  const url = useObjectUrl(item.blob);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else void el.play();
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="rounded-full bg-primary p-2 text-primary-foreground"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 text-xs text-muted-foreground">Voice note {index}</div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Delete recording"
        className="rounded-full p-2 text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
