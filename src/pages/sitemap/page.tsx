import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMenu } from "@/hooks/useMenu";
import type { MenuNode } from "@/types/menu";
import PageHeader from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/Animation";

function NodeLink({ node }: { node: MenuNode }) {
  if (!node.href || node.href === "#") {
    return <span className="text-foreground-700">{node.title}</span>;
  }
  const isExternal = node.href.startsWith("http");
  return isExternal ? (
    <a
      href={node.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground-700 hover:text-primary-600 transition-colors duration-200"
    >
      {node.title}
    </a>
  ) : (
    <a href={node.href} className="text-foreground-700 hover:text-primary-600 transition-colors duration-200">
      {node.title}
    </a>
  );
}

export default function SitemapPage() {
  const { t } = useTranslation();
  usePageMeta(t("footer.saytXaritasi"));
  const { menu, loading } = useMenu();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  return (
    <div>
      <PageHeader title={t("footer.saytXaritasi")} />

      <section className="section-pad bg-transparent">
        <div className="section-container">
          {!ready ? (
            <LoadingState />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {menu.map((top, i) => (
                <Reveal key={top.id} delay={i * 60} className="h-full">
                  <div className="h-full page-card p-4 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                    <h2 className="font-heading text-lg font-bold text-foreground-950 mb-3 pb-2.5 border-b border-background-200">
                      {top.title}
                    </h2>
                    <ul className="space-y-2">
                      {top.children.map((child) => (
                        <li key={child.id}>
                          <NodeLink node={child} />
                          {child.children.length > 0 && (
                            <ul className="pl-4 mt-2 space-y-1.5 border-l border-background-200">
                              {child.children.map((grandchild) => (
                                <li key={grandchild.id} className="text-sm pl-2">
                                  <NodeLink node={grandchild} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
