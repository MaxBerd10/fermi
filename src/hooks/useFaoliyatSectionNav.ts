import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findFaoliyatSectionMenuById } from "@/lib/faoliyatSection";

export function useFaoliyatSectionNav(menuId: number) {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findFaoliyatSectionMenuById(menu, menuId), [menu, menuId]);

  return {
    loading,
    title: section?.title ?? "",
    items: section?.items ?? [],
  };
}
