import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listGallery } from "@/api/gallery";
import type { GalleryImage } from "@/types/content";
import { Reveal } from "@/components/Animation";
import { CAMPUS_PHOTOS, isHomeSafeImage } from "@/lib/mediaFilter";

type GalleryItem = {
  id: number;
  img: string;
  title: string;
  href: string;
};

export default function Gallery() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<GalleryItem[]>(() =>
    CAMPUS_PHOTOS.map((c, i) => ({
      id: c.id,
      img: c.img,
      title: t(`gallery.caption${i + 1}`),
      href: "/galereya",
    }))
  );

  useEffect(() => {
    let cancelled = false;

    listGallery(1)
      .catch(() => ({ data: [] as GalleryImage[] }))
      .then((galleryRes) => {
        if (cancelled) return;

        const fromApi: GalleryItem[] = (galleryRes.data ?? [])
          .filter((g) => isHomeSafeImage(g.img, g.title))
          .map((g, i) => ({
            id: g.id,
            img: g.img,
            title: g.title?.trim() || t(`gallery.caption${(i % 5) + 1}`),
            href: `/full-gallery/${g.id}`,
          }));

        const merged: GalleryItem[] = [];
        for (const item of fromApi) {
          if (merged.length >= 5) break;
          if (!merged.some((m) => m.img === item.img)) merged.push(item);
        }

        for (const c of CAMPUS_PHOTOS) {
          if (merged.length >= 5) break;
          if (!merged.some((m) => m.img === c.img)) {
            merged.push({
              id: c.id,
              img: c.img,
              title: t(`gallery.caption${merged.length + 1}`),
              href: "/galereya",
            });
          }
        }

        setItems(merged.slice(0, 5));
      });

    return () => {
      cancelled = true;
    };
  }, [i18n.language, t]);

  return (
    <section className="py-5 md:py-6 bg-transparent border-t border-[#e5e5e5]/60">
      <div className="section-container">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <div>
              <p className="section-eyebrow !mb-2">{t("gallery.eyebrow")}</p>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight max-w-2xl">
                {t("gallery.headingPrefix")} {t("gallery.headingHighlight")}
              </h2>
            </div>
            <Link to="/galereya" className="uni-link cursor-pointer self-start md:self-auto">
              {t("gallery.viewAllAlbums")}
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {items.map((item) => (
              <figure key={item.id} className="min-w-0">
                <Link
                  to={item.href}
                  className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-background-200 border border-primary-100 cursor-pointer"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={360}
                  />
                </Link>
                <figcaption className="mt-2">
                  <h3 className="font-medium text-foreground-900 text-xs leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
