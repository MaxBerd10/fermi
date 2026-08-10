import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findNewspaperSectionMenu } from "@/lib/newspaperSection";

export function useNewspaperSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findNewspaperSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Institut gazetasi",
    items: section?.items ?? [],
  };
}
