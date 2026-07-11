import { useRef } from "react";
import { Camera, User } from "lucide-react";
import { useObjectUrl } from "@/hooks/use-object-url";
import { updateProfile } from "@/lib/profile";

export function AvatarPicker({ blob }: { blob?: Blob }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useObjectUrl(blob);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile photo"
        className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 bg-muted shadow-sm"
      >
        {url ? (
          <img src={url} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <User className="h-10 w-10" />
          </div>
        )}
        <span className="absolute inset-0 flex items-end justify-center bg-black/0 pb-1 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
          <Camera className="h-4 w-4" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await updateProfile({ avatarBlob: file, avatarMime: file.type });
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
