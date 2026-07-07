import { useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { useObjectUrl } from "@/hooks/use-object-url";

export interface PhotoItem {
  key: string;
  blob: Blob;
}

export function PhotoPicker({
  photos,
  onAdd,
  onRemove,
}: {
  photos: PhotoItem[];
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
}) {
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => camRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold"
        >
          <Camera className="h-4 w-4" /> Camera
        </button>
        <button
          type="button"
          onClick={() => galRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold"
        >
          <ImagePlus className="h-4 w-4" /> Gallery
        </button>
      </div>
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onAdd(files);
          e.target.value = "";
        }}
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onAdd(files);
          e.target.value = "";
        }}
      />
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <Thumb key={p.key} item={p} onRemove={() => onRemove(p.key)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Thumb({ item, onRemove }: { item: PhotoItem; onRemove: () => void }) {
  const url = useObjectUrl(item.blob);
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
      {url && <img src={url} alt="Sighting photo" className="h-full w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
