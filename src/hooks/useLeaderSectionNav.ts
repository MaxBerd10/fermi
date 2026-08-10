import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findLeaderSectionMenu } from "@/lib/leaderSection";

export function useLeaderSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findLeaderSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "",
    items: section?.items ?? [],
  };
}
