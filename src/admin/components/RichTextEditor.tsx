import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { uploadMedia } from "@/api/admin";
import MediaLibraryModal from "./MediaLibraryModal";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  icon: string;
}

function ToolbarButton({ active, disabled, onClick, title, icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-primary-500 text-background-50" : "text-foreground-600 hover:bg-background-200"
      }`}
    >
      <i className={icon} />
    </button>
  );
}

/**
 * TipTap-based WYSIWYG editor for content_* fields. Legacy data is
 * CKEditor-authored HTML — TipTap's StarterKit round-trips the common tags
 * that content actually uses (p/strong/em/ul/ol/a/img/h2-h3/blockquote)
 * cleanly; more exotic CKEditor-only inline styling may not survive a
 * resave pixel-for-pixel, but the content stays intact and editable.
 * A "Kod" (HTML source) toggle is kept for anyone who wants to hand-edit
 * markup the visual toolbar doesn't expose.
 */
export default function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedHtml = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[220px] px-4 py-3 focus:outline-none [&_img]:max-w-full [&_img]:rounded-md",
      },
    },
  });

  // Syncs external value changes (e.g. async data load on an edit page,
  // where this component mounts before the fetch resolves) into the editor.
  // Guarded against the editor's own onUpdate so it doesn't fight typing.
  useEffect(() => {
    if (!editor) return;
    if (value !== lastEmittedHtml.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      lastEmittedHtml.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  function insertImage(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
  }

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadMedia(file);
      insertImage(result.url);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Havola manzili (URL):", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-foreground-700">{label}</label>
        <div className="flex rounded-md border border-background-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`text-xs px-2.5 py-1 cursor-pointer ${mode === "visual" ? "bg-primary-500 text-background-50" : "text-foreground-600 hover:bg-background-100"}`}
          >
            Vizual
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`text-xs px-2.5 py-1 cursor-pointer ${mode === "code" ? "bg-primary-500 text-background-50" : "text-foreground-600 hover:bg-background-100"}`}
          >
            Kod
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="rounded-md border border-background-300 bg-background-50 overflow-hidden">
          {editor && (
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-background-200 bg-background-100">
              <ToolbarButton title="Qalin" icon="ri-bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
              <ToolbarButton title="Kursiv" icon="ri-italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
              <ToolbarButton title="Tagiga chizilgan" icon="ri-underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
              <ToolbarButton title="Chizilgan" icon="ri-strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
              <span className="w-px h-5 bg-background-300 mx-1" />
              <ToolbarButton title="Sarlavha 2" icon="ri-h-2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
              <ToolbarButton title="Sarlavha 3" icon="ri-h-3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
              <span className="w-px h-5 bg-background-300 mx-1" />
              <ToolbarButton title="Ro'yxat (belgili)" icon="ri-list-unordered" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
              <ToolbarButton title="Ro'yxat (raqamli)" icon="ri-list-ordered" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
              <ToolbarButton title="Iqtibos" icon="ri-double-quotes-l" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
              <span className="w-px h-5 bg-background-300 mx-1" />
              <ToolbarButton title="Havola" icon="ri-link" active={editor.isActive("link")} onClick={setLink} />
              <ToolbarButton title="Rasm (yuklash)" icon={uploading ? "ri-loader-4-line animate-spin" : "ri-image-add-line"} onClick={() => fileInputRef.current?.click()} />
              <ToolbarButton title="Rasm (kutubxonadan)" icon="ri-folder-image-line" onClick={() => setLibraryOpen(true)} />
              <span className="w-px h-5 bg-background-300 mx-1" />
              <ToolbarButton title="Bekor qilish" icon="ri-arrow-go-back-line" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
              <ToolbarButton title="Qaytarish" icon="ri-arrow-go-forward-line" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="w-full px-4 py-3 rounded-md border border-background-300 bg-background-50 text-sm font-mono focus:outline-none focus:border-primary-500"
        />
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={onUploadFile} />
      {libraryOpen && (
        <MediaLibraryModal
          onSelect={(_path, url) => {
            insertImage(url);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}
