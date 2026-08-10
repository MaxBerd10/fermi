import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findConferenceSectionMenu } from "@/lib/conferenceSection";

export function useConferenceSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findConferenceSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "Institut konferensiyalari",
    items: section?.items ?? [],
  };
}
