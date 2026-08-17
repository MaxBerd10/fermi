import { useEffect, useState } from "react";
import { listMedia, type MediaListing } from "@/api/adminMediaLibrary";

interface Props {
  onSelect: (path: string, url: string) => void;
  onClose: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryModal({ onSelect, onClose }: Props) {
  const [listing, setListing] = useState<MediaListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load(path: string) {
    setLoading(true);
    setError("");
    listMedia(path)
      .then(setListing)
      .catch(() => setError("Ro'yxatni yuklashda xatolik yuz berdi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load("");
  }, []);

  const segments = listing?.currentPath ? listing.currentPath.split("/") : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-background-50 rounded-xl border border-background-200 shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-background-200 shrink-0">
          <div>
            <h2 className="font-semibold text-foreground-900">Fayl kutubxonasi</h2>
            <div className="text-xs text-foreground-500 mt-0.5 flex items-center gap-1 flex-wrap">
              <button onClick={() => load("")} className="hover:text-primary-600 cursor-pointer">uploads/img</button>
              {segments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  <i className="ri-arrow-right-s-line" />
                  <button onClick={() => load(segments.slice(0, i + 1).join("/"))} className="hover:text-primary-600 cursor-pointer">
                    {seg}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-foreground-400 hover:bg-background-200 cursor-pointer">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-16 flex justify-center">
              <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center animate-spin text-primary-500 text-3xl" />
            </div>
          ) : error ? (
            <div className="p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {listing?.parentPath !== null && listing?.parentPath !== undefined && (
                <button
                  onClick={() => load(listing.parentPath as string)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-background-200 hover:bg-background-100 cursor-pointer"
                >
                  <i className="ri-arrow-go-back-line text-2xl text-foreground-400" />
                  <span className="text-xs text-foreground-500">Orqaga</span>
                </button>
              )}

              {listing?.folders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => load(folder.path)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-background-200 hover:bg-background-100 cursor-pointer"
                  title={folder.name}
                >
                  <i className="ri-folder-line text-2xl text-primary-400" />
                  <span className="text-xs text-foreground-700 truncate w-full text-center">{folder.name}</span>
                </button>
              ))}

              {listing?.files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelect(file.path, file.url)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-background-200 hover:border-primary-400 hover:bg-primary-50 cursor-pointer group"
                  title={file.name}
                >
                  {file.isImage ? (
                    <img src={file.url} alt="" className="w-full h-16 object-cover rounded-md bg-background-100" loading="lazy" />
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center rounded-md bg-background-100">
                      <i className="ri-file-line text-2xl text-foreground-400" />
                    </div>
                  )}
                  <span className="text-[11px] text-foreground-600 truncate w-full text-center">{file.name}</span>
                  <span className="text-[10px] text-foreground-400">{formatSize(file.size)}</span>
                </button>
              ))}

              {listing && listing.folders.length === 0 && listing.files.length === 0 && (
                <div className="col-span-full text-center text-sm text-foreground-400 py-8">Bu papka bo'sh.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
