export type GalleryItem = {
  src: string;
  caption: string;
  alt: string;
};

export type GalleryVariant = "certificates" | "roadmap" | "diagram" | "document" | "accreditation";

const CERT_CAPTION_MAP: Record<string, string> = {
  "ui-2025": "UI — 2025",
  "ui -2025": "UI — 2025",
  dentistry: "Stomatologiya",
  pediatrics: "Pediatriya",
  pharmacy: "Farmatsiya",
  "xalqaro akkreditatsiya": "Xalqaro akkreditatsiya",
};

function captionFromSrc(src: string, variant: GalleryVariant): string {
  try {
    const raw = decodeURIComponent(src.split("/").pop() ?? "")
      .replace(/\.[^.]+$/, "")
      .trim();

    if (variant === "roadmap") {
      const pageMatch = raw.match(/page-0*(\d+)/i) || raw.match(/-0*(\d+)$/);
      if (pageMatch) return `Sahifa ${parseInt(pageMatch[1], 10)}`;
    }

    if (variant === "diagram" || variant === "document") {
      if (variant === "document") return "Lavozim yo'riqnomasi";
      return "Institut tuzilmasi sxemasi";
    }

    if (variant === "accreditation") return "ECAQA xalqaro maxsus akkreditatsiya";

    const key = raw.toLowerCase();
    for (const [pattern, label] of Object.entries(CERT_CAPTION_MAP)) {
      if (key.includes(pattern)) return label;
    }
    return raw.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  } catch {
    return variant === "roadmap" ? "Sahifa" : "Sertifikat";
  }
}

/** CMS HTML ichidan galereya rasmlarini ajratib oladi */
export function parseImageGallery(
  html: string,
  variant: GalleryVariant = "certificates",
): { items: GalleryItem[]; footerNote: string | null } {
  if (!html?.trim() || typeof DOMParser === "undefined") {
    return { items: [], footerNote: null };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  let footerNote: string | null = null;
  body.querySelectorAll("p").forEach((p) => {
    if (p.querySelector("img")) return;
    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (text.length > 20) footerNote = text;
  });

  const items: GalleryItem[] = [];
  body.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    const caption = captionFromSrc(src, variant);
    items.push({
      src,
      caption,
      alt: img.getAttribute("alt")?.trim() || caption,
    });
  });

  if (footerNote && items.length > 0 && variant === "certificates") {
    items[items.length - 1].caption = footerNote;
    footerNote = null;
  }

  return { items, footerNote };
}

export function getGalleryVariant(slug?: string, html?: string): GalleryVariant | null {
  const s = slug ?? "";
  if (s === "institut-sertifikatlari" || /sertifikat/i.test(s)) return "certificates";
  if (s === "institut-tuzilmasi" || /tuzilmasi/i.test(s)) return "diagram";
  if (s === "lavozim-yoriqnomasi" || /yoriqnoma/i.test(s)) return "document";
  if (s === "ecaqa-xalqaro-maxsus-akkreditatsiya" || /ecaqa|xalqaro-maxsus-akkreditatsiya/i.test(s)) {
    return "accreditation";
  }
  if (/yol-xaritasi|yo-l-xaritasi|xaritasi-202/i.test(s)) return "roadmap";

  const { items } = parseImageGallery(html ?? "", "certificates");
  if (items.length === 0) return null;
  if (items.length === 1) return "diagram";
  if (items.some((i) => /karta_page|page-\d+/i.test(i.src))) return "roadmap";
  if (items.length >= 2) {
    const textLen = (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s/g, "").length;
    if (textLen < 900) return "certificates";
  }
  return null;
}

/** @deprecated use getGalleryVariant */
export function isCertificateGalleryPage(html: string, slug?: string): boolean {
  return getGalleryVariant(slug, html) === "certificates";
}

export type CertificateItem = GalleryItem;
export const parseCertificateGallery = (html: string) =>
  parseImageGallery(html, "certificates");
