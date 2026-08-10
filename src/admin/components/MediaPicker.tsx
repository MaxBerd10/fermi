import { useRef, useState } from "react";
import { uploadMedia } from "@/api/admin";
import MediaLibraryModal from "./MediaLibraryModal";

interface MediaPickerProps {
  label: string;
  value: string | null | undefined;
  onChange: (path: string) => void;
  previewBaseUrl?: string;
}

/** Upload button + "choose from library" + thumbnail preview, writing the root-relative path (e.g. "/uploads/img/admin/...") into the bound field — matches every legacy img/file column's stored format. */
export default function MediaPicker({ label, value, onChange, previewBaseUrl = "http://frontend.fjsti.local" }: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadMedia(file);
      onChange(result.path);
    } catch {
      setError("Fayl yuklashda xatolik yuz berdi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewUrl = value ? (value.startsWith("http") ? value : previewBaseUrl + value) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {previewUrl && (
          <img src={previewUrl} alt="" className="w-16 h-16 object-cover rounded-md border border-background-300" />
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="h-10 px-4 rounded-md border border-background-300 text-sm font-medium text-foreground-700 hover:bg-background-100 cursor-pointer disabled:opacity-60 flex items-center gap-2"
        >
          {uploading ? (
            <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin" />
          ) : (
            <i className="ri-upload-2-line w-4 h-4 flex items-center justify-center" />
          )}
          {value ? "Almashtirish" : "Yuklash"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="h-10 px-4 rounded-md border border-background-300 text-sm font-medium text-foreground-700 hover:bg-background-100 cursor-pointer flex items-center gap-2"
        >
          <i className="ri-folder-image-line w-4 h-4 flex items-center justify-center" />
          Kutubxonadan
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-sm text-foreground-500 hover:text-accent-600 cursor-pointer">
            Olib tashlash
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={onFileSelected} accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
      {error && <p className="mt-1 text-xs text-accent-600">{error}</p>}
      {libraryOpen && (
        <MediaLibraryModal
          onSelect={(path) => {
            onChange(path);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}
