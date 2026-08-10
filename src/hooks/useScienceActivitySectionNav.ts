import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findScienceActivitySectionMenu } from "@/lib/scienceActivitySection";

export function useScienceActivitySectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findScienceActivitySectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Ilmiy faoliyat",
    items: section?.items ?? [],
  };
}
