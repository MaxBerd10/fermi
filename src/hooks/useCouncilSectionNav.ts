import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findCouncilSectionMenu } from "@/lib/councilSection";

export function useCouncilSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findCouncilSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Institut kengashi",
    items: section?.items ?? [],
  };
}
