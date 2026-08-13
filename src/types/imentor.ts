export interface ImentorQuestionLang {
  question: string;
  options: string[];
  explanation?: string;
  optionExplanations?: string[];
}

export interface ImentorReference {
  title: string;
  authors?: string;
  publisher?: string;
  year?: string;
  url?: string;
  pages?: string;
}

export interface ImentorSampleQuestion {
  correctOptionIndex: number;
  available_languages: string[];
  languages: Record<string, ImentorQuestionLang>;
  references?: ImentorReference[];
  source_test_id: number;
}

export interface ImentorSampleResponse {
  subject_code: string;
  department_code: string;
  available_languages: string[];
  count_requested: number;
  count_available: number;
  count_returned: number;
  questions: ImentorSampleQuestion[];
}

export interface ImentorCaseScenario {
  scenario: string;
  answer: string;
  focus?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  references?: ImentorReference[];
  source_case_id: number;
  topic?: string;
}

export interface ImentorSubjectStat {
  subject_code: string;
  subject_name: string;
  department_code?: string;
  department_name?: string;
  test_count?: number;
  case_count?: number;
  questions_total: number;
  topics_distinct?: number;
}

export interface ImentorStatsResponse {
  totals: { test_count: number; case_count: number; questions_total: number };
  by_subject: ImentorSubjectStat[];
}

export interface ImentorScenariosResponse {
  count: number;
  page: number;
  page_size: number;
  count_available: number;
  count_returned: number;
  results: ImentorCaseScenario[];
}
