import type { EntityConfig } from "./genericTypes";

const STATUS_OPTIONS = [
  { value: 1, label: "Faol" },
  { value: 0, label: "Nofaol" },
];

export const facultyConfig: EntityConfig = {
  resource: "faculty",
  title: "Fakultetlar",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "media", key: "img", label: "Rasm", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Matn" },
  ],
};

export const departmentsConfig: EntityConfig = {
  resource: "departments",
  title: "Kafedralar",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "media", key: "img", label: "Rasm", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Matn" },
  ],
};

export const leaderConfig: EntityConfig = {
  resource: "leaders",
  title: "Rahbariyat",
  listColumns: [{ key: "id", label: "ID" }, { key: "name_uz", label: "F.I.SH" }, { key: "position_uz", label: "Lavozim" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "name_uz",
  fields: [
    { kind: "lang-text", base: "name", label: "F.I.SH", requiredUz: true },
    { kind: "lang-text", base: "position", label: "Lavozim", requiredUz: true },
    { kind: "async-select", key: "category_id", label: "Toifa", required: true, optionsResource: "leadercategories", optionsLabelKey: "title_uz" },
    { kind: "media", key: "rasm", label: "Foto", required: true },
    { kind: "text", key: "phone", label: "Telefon", required: true },
    { kind: "text", key: "faks", label: "Faks" },
    { kind: "text", key: "email", label: "Email", required: true },
    { kind: "lang-text", base: "reception_days", label: "Qabul kunlari", requiredUz: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "activity", label: "Faoliyati" },
    { kind: "lang-html", base: "biography", label: "Tarjimai holi" },
  ],
};

export const leadercategoryConfig: EntityConfig = {
  resource: "leadercategories",
  title: "Rahbariyat toifalari",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "checkbox", key: "is_faculty", label: "Fakultet toifasimi" },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const documentsConfig: EntityConfig = {
  resource: "documents",
  title: "Hujjatlar to'plami",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const documentsitemConfig: EntityConfig = {
  resource: "documents-items",
  title: "Hujjat elementlari",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "async-select", key: "document_id", label: "Hujjatlar to'plami", required: true, optionsResource: "documents", optionsLabelKey: "title_uz" },
    { kind: "lang-text", base: "title", label: "Nomi" },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Matn" },
  ],
};

export const imgConfig: EntityConfig = {
  resource: "gallery-images",
  title: "Foto galereya",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "media", key: "img", label: "Rasm", required: true },
    { kind: "lang-text", base: "title", label: "Nomi" },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Izoh" },
  ],
};

export const videoConfig: EntityConfig = {
  resource: "videos",
  title: "Video",
  listColumns: [{ key: "id", label: "ID" }, { key: "url", label: "URL" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "url",
  fields: [
    { kind: "text", key: "video", label: "Video fayl yo'li" },
    { kind: "text", key: "url", label: "Tashqi video URL (YouTube va h.k.)" },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const courseConfig: EntityConfig = {
  resource: "courses",
  title: "Kurslar",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const scheduleConfig: EntityConfig = {
  resource: "schedules",
  title: "Dars jadvali",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "async-select", key: "course_id", label: "Kurs", required: true, optionsResource: "courses", optionsLabelKey: "title_uz" },
    { kind: "media", key: "file", label: "Fayl (PDF)", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const coruselConfig: EntityConfig = {
  resource: "corusel",
  title: "Bosh sahifa banneri",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi" },
    { kind: "media", key: "img", label: "Rasm" },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Matn" },
  ],
};

export const networkConfig: EntityConfig = {
  resource: "networks",
  title: "Ijtimoiy tarmoqlar",
  listColumns: [{ key: "id", label: "ID" }, { key: "titlte", label: "Nomi" }, { key: "url", label: "Havola" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "titlte",
  fields: [
    { kind: "text", key: "titlte", label: "Nomi", required: true },
    { kind: "text", key: "icon", label: "Ikonka (masalan: ri-telegram-line)", required: true },
    { kind: "text", key: "url", label: "Havola", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const usefulSitesConfig: EntityConfig = {
  resource: "useful-sites",
  title: "Foydali havolalar",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "url", label: "Havola" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "media", key: "img", label: "Rasm", required: true },
    { kind: "text", key: "url", label: "Havola", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const aboutConfig: EntityConfig = {
  resource: "about",
  title: "Institut haqida",
  listColumns: [{ key: "id", label: "ID" }, { key: "title_uz", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "title_uz",
  fields: [
    { kind: "lang-text", base: "title", label: "Nomi", requiredUz: true },
    { kind: "media", key: "img", label: "Rasm", required: true },
    { kind: "text", key: "url", label: "Batafsil havola (ichki yo'l)", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
    { kind: "lang-html", base: "content", label: "Matn" },
  ],
};

export const contactConfig: EntityConfig = {
  resource: "contacts",
  title: "Murojaatlar (Aloqa formasi)",
  addLabel: "Qo'shish",
  listColumns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Ism" },
    { key: "subject", label: "Mavzu" },
    { key: "email", label: "Email" },
    { key: "status", label: "Holat" },
  ],
  deleteConfirmField: "name",
  fields: [
    { kind: "text", key: "name", label: "Ism", required: true },
    { kind: "text", key: "subject", label: "Mavzu", required: true },
    { kind: "text", key: "phone", label: "Telefon", required: true },
    { kind: "text", key: "email", label: "Email", required: true },
    { kind: "select", key: "status", label: "Holat", options: STATUS_OPTIONS },
    { kind: "textarea", key: "message", label: "Xabar matni", required: true },
  ],
};

export const acceptanceConfig: EntityConfig = {
  resource: "acceptances",
  title: "Qabul arizalari",
  addLabel: "Qo'shish",
  listColumns: [
    { key: "id", label: "ID" },
    { key: "fish", label: "F.I.SH" },
    { key: "subject", label: "Mavzu" },
    { key: "phone", label: "Telefon" },
  ],
  deleteConfirmField: "fish",
  fields: [
    { kind: "async-select", key: "category_id", label: "Toifa", required: true, optionsResource: "leadercategories", optionsLabelKey: "title_uz" },
    { kind: "text", key: "fish", label: "F.I.SH", required: true },
    { kind: "text", key: "subject", label: "Mavzu", required: true },
    { kind: "text", key: "phone", label: "Telefon", required: true },
    { kind: "text", key: "email", label: "Email", required: true },
    { kind: "geo-selects", label: "Manzil", regionKey: "region_id", districtKey: "district_id", quarterKey: "quater_id", required: true },
  ],
};

export const virtualConfig: EntityConfig = {
  resource: "virtual-submissions",
  title: "Virtual qabulxona murojaatlari",
  addLabel: "Qo'shish",
  listColumns: [
    { key: "id", label: "ID" },
    { key: "fish", label: "F.I.SH" },
    { key: "phone", label: "Telefon" },
    { key: "email", label: "Email" },
  ],
  deleteConfirmField: "fish",
  fields: [
    { kind: "text", key: "fish", label: "F.I.SH", required: true },
    { kind: "async-select", key: "faculty_id", label: "Fakultet", required: true, optionsResource: "faculty", optionsLabelKey: "title_uz" },
    { kind: "geo-selects", label: "Viloyat / tuman", regionKey: "province", districtKey: "fog", required: true },
    { kind: "text", key: "address", label: "Manzil", required: true },
    { kind: "text", key: "phone", label: "Telefon", required: true },
    { kind: "text", key: "email", label: "Email", required: true },
    { kind: "text", key: "gender", label: "Jinsi" },
    { kind: "media", key: "file", label: "Biriktirilgan fayl" },
    { kind: "textarea", key: "text", label: "Murojaat matni", required: true },
  ],
};

export const translationConfig: EntityConfig = {
  resource: "translations",
  title: "Tarjimalar (UI matnlari)",
  listColumns: [
    { key: "id", label: "ID" },
    { key: "category", label: "Kategoriya" },
    { key: "message", label: "Asl matn (kalit)" },
    { key: "translation_uz", label: "UZ tarjimasi" },
  ],
  deleteConfirmField: "message",
  fields: [
    { kind: "text", key: "category", label: "Kategoriya", required: true },
    { kind: "textarea", key: "message", label: "Asl matn (kalit — kod ichida Yii::t() orqali chaqiriladi)", required: true },
    { kind: "lang-text", base: "translation", label: "Tarjima" },
  ],
};

export const connectLeaderConfig: EntityConfig = {
  resource: "connect-leaders",
  title: "Aloqa uchun mas'ullar",
  listColumns: [{ key: "id", label: "ID" }, { key: "name", label: "Nomi" }, { key: "status", label: "Holat" }],
  deleteConfirmField: "name",
  fields: [
    { kind: "text", key: "name", label: "Nomi", required: true },
    { kind: "select", key: "status", label: "Holat", required: true, options: STATUS_OPTIONS },
  ],
};

export const counterConfig: EntityConfig = {
  resource: "counter",
  title: "Statistika (bosh sahifa raqamlari)",
  listColumns: [],
  deleteConfirmField: "id",
  fields: [
    { kind: "number", key: "professor_teachers", label: "Professor-o'qituvchilar soni", required: true },
    { kind: "number", key: "students", label: "Talabalar soni", required: true },
    { kind: "number", key: "graduaters", label: "Bitiruvchilar soni", required: true },
    { kind: "number", key: "book_fund", label: "Kitob fondi", required: true },
  ],
};

export const settingConfig: EntityConfig = {
  resource: "setting",
  title: "Umumiy sozlamalar",
  listColumns: [],
  deleteConfirmField: "id",
  fields: [
    { kind: "text", key: "phone", label: "Telefon", required: true },
    { kind: "text", key: "faks", label: "Faks" },
    { kind: "text", key: "email", label: "Email", required: true },
    { kind: "lang-text", base: "address", label: "Manzil", requiredUz: true },
  ],
};

export const logoConfig: EntityConfig = {
  resource: "logo",
  title: "Logotip",
  listColumns: [],
  deleteConfirmField: "id",
  fields: [
    { kind: "media", key: "img", label: "Logotip rasmi", required: true },
    { kind: "lang-text", base: "title", label: "Sarlavha" },
    { kind: "lang-text", base: "subtitle", label: "Kichik sarlavha" },
  ],
};

export const ALL_ENTITY_CONFIGS = [
  facultyConfig,
  departmentsConfig,
  leaderConfig,
  leadercategoryConfig,
  documentsConfig,
  documentsitemConfig,
  imgConfig,
  videoConfig,
  courseConfig,
  scheduleConfig,
  coruselConfig,
  networkConfig,
  usefulSitesConfig,
  aboutConfig,
  contactConfig,
  acceptanceConfig,
  virtualConfig,
  connectLeaderConfig,
  translationConfig,
];

export const SINGLETON_CONFIGS = [counterConfig, settingConfig, logoConfig];
