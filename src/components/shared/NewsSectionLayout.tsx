import type { ReactNode } from "react";
import { Reveal } from "@/components/Animation";
import NewsSectionNav from "@/components/shared/NewsSectionNav";
import MenuSectionNav from "@/components/shared/MenuSectionNav";

export default function NewsSectionLayout({
  children,
  intro,
  currentSlug,
  showAllNews = true,
  theme,
  hero,
  menuSectionId,
}: {
  children: ReactNode;
  intro?: string;
  currentSlug?: string;
  showAllNews?: boolean;
  theme?: string;
  hero?: ReactNode;
  menuSectionId?: number;
}) {
  return (
    <section
      className={`section-pad !pt-3 md:!pt-4 bg-transparent news-section${theme ? ` news-section--${theme}` : ""}`}
    >
      <div className="section-container grid gap-5 lg:gap-6 items-start lg:grid-cols-12">
        <div className="lg:col-span-8 min-w-0">
          {hero && <Reveal>{hero}</Reveal>}
          {intro && !hero && (
            <Reveal>
              <p className="news-section__intro">{intro}</p>
            </Reveal>
          )}
          {children}
        </div>

        <aside className="lg:col-span-4 min-w-0">
          <Reveal delay={80}>
            {menuSectionId ? (
              <MenuSectionNav menuId={menuSectionId} currentSlug={currentSlug} />
            ) : (
              <NewsSectionNav currentSlug={currentSlug} showAllNews={showAllNews} />
            )}
          </Reveal>
        </aside>
      </div>
    </section>
  );
}
