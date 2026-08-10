import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findNewsSectionMenu } from "@/lib/newsSection";

export function useNewsSectionNav() {
  const { menu, loading } = useMenu();

  const section = useMemo(() => findNewsSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Institut yangiliklari",
    items: section?.items ?? [],
  };
}
