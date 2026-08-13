import { imentorGet } from "./imentorClient";
import type { ImentorStatsResponse, ImentorSampleResponse, ImentorScenariosResponse } from "@/types/imentor";

// Most departments in the catalog have no published tests/cases yet — stats' `by_subject`
// only lists subjects that actually have content, so pickers built from it never dead-end.
export async function getImentorTestStats() {
  const data = await imentorGet<ImentorStatsResponse>("v1/external/tests/stats/");
  return data.by_subject.filter((s) => (s.test_count || 0) > 0);
}

export async function getImentorKeyStats() {
  const data = await imentorGet<ImentorStatsResponse>("v1/external/keys/stats/");
  return data.by_subject.filter((s) => (s.case_count || 0) > 0);
}

export async function getImentorSampleQuestions(params: {
  subjectCode?: string;
  departmentCode?: string;
  count?: number;
}) {
  return imentorGet<ImentorSampleResponse>("v1/external/questions/sample/", {
    subject_code: params.subjectCode,
    department_code: params.departmentCode,
    count: params.count,
  });
}

export async function getImentorCaseScenarios(params: {
  subjectCode?: string;
  departmentCode?: string;
  count?: number;
}) {
  return imentorGet<ImentorScenariosResponse>("v1/external/keys/scenarios/", {
    subject_code: params.subjectCode,
    department_code: params.departmentCode,
    count: params.count,
    shuffle: false,
  });
}
