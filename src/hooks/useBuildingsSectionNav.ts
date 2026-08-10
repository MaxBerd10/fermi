import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findBuildingsSectionMenu } from "@/lib/buildingsSection";

export function useBuildingsSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findBuildingsSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Institut binolari",
    items: section?.items ?? [],
  };
}
