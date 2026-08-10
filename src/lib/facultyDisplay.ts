import type { Leader } from "@/types/content";
import { displayLeaderText } from "@/lib/leaderDisplay";

export function isFacultyDean(leader: Leader, facultyTitle: string, index: number): boolean {
  const p = leader.position.toLowerCase();
  if (/o[''`]?rinbosar|o'rinbosar|muovin/.test(p)) return false;
  if (/fakultet dekani/.test(p) || /^dekan$/i.test(p) || (p.includes("dekan") && !/o[''`]?rinbosar/.test(p))) return true;
  if (displayLeaderText(leader.position) === displayLeaderText(facultyTitle)) return true;
  return index === 0;
}

export function getFacultyRoleKey(leader: Leader, facultyTitle: string, index: number): string {
  if (isFacultyDean(leader, facultyTitle, index)) return "faculty.role.dean";
  const p = leader.position.toLowerCase();
  if (/o[''`]?quv|oquv ishlar/.test(p)) return "leader.role.education";
  if (/yoshlar|ma.naviy|marifiy/.test(p)) return "leader.role.youth";
  if (/xalqaro/.test(p)) return "faculty.role.international";
  return "faculty.role.deputy";
}

export type FacultyRoleTone = "dean" | "education" | "youth" | "international" | "deputy";

export function getFacultyRoleTone(leader: Leader, facultyTitle: string, index: number): FacultyRoleTone {
  if (isFacultyDean(leader, facultyTitle, index)) return "dean";
  const p = leader.position.toLowerCase();
  if (/o[''`]?quv|oquv ishlar/.test(p)) return "education";
  if (/yoshlar|ma.naviy|marifiy/.test(p)) return "youth";
  if (/xalqaro/.test(p)) return "international";
  return "deputy";
}
