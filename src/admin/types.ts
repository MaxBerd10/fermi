export interface AdminPost {
  id: number;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  content_uz: string | null;
  content_ru: string | null;
  content_en: string | null;
  category_id: number;
  date: string | null;
  seen: number;
  slug: string | null;
  status: number;
  img: string | null;
  file: string | null;
  file_en: string | null;
  file_ru: string | null;
  meta_key: string | null;
}

export interface AdminPage {
  id: number;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  content_uz: string | null;
  content_ru: string | null;
  content_en: string | null;
  slug: string | null;
  file: string | null;
  file_en: string | null;
  file_ru: string | null;
  date: string | null;
  status: number;
  korish: number;
  meta_key: string | null;
}

export interface AdminPostcategory {
  id: number;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  slug: string | null;
  status: number;
}
