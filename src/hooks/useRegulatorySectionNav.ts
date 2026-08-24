import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findRegulatorySectionMenu } from "@/lib/regulatorySection";

export function useRegulatorySectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findRegulatorySectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Meʻyoriy hujjatlar",
    items: section?.items ?? [],
  };
}
