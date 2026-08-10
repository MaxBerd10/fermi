import { useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { findJournalSectionMenu } from "@/lib/journalSection";

export function useJournalSectionNav() {
  const { menu, loading } = useMenu();
  const section = useMemo(() => findJournalSectionMenu(menu), [menu]);

  return {
    loading,
    title: section?.title ?? "FJSTI Ilmiy jurnali",
    items: section?.items ?? [],
  };
}
