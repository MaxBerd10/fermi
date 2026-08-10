import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BAKALAVRIAT_MENU_ID } from "@/lib/bakalavriatSection";
import { MAGISTRATURA_MENU_ID } from "@/lib/magistraturaSection";
import { ORDINATURA_MENU_ID } from "@/lib/ordinaturaSection";
import { QOSHMA_MENU_ID } from "@/lib/qoshmaSection";
import { KOCHIRISH_MENU_ID } from "@/lib/kochirishSection";
import { DOKTORANTURA_MENU_ID } from "@/lib/doktoranturaSection";
import { INTERNATURA_MENU_ID } from "@/lib/internaturaSection";
import { XORIJIY_QABUL_MENU_ID } from "@/lib/xorijiyQabulSection";
import { TEXNIKUM_BITIRUV_MENU_ID } from "@/lib/texnikumBitiruvSection";

const RELATED_BY_MENU: Record<number, { href: string; labelKey: string; icon: string }[]> = {
  [BAKALAVRIAT_MENU_ID]: [
    { href: "/blog/99/online-royxatdan-otish-2025", labelKey: "admission.link.onlineRegister", icon: "ri-user-add-line" },
    { href: "/blog/99/qabul-nizomi", labelKey: "admission.link.qabulNizomi", icon: "ri-scales-3-line" },
    { href: "/blog/99/bakalavriat-qabul-kvotasi-2025", labelKey: "admission.link.qabulKvota", icon: "ri-pie-chart-line" },
    { href: "/blog/99/imtihon-fanlar-royxati", labelKey: "admission.link.imtihonFanlar", icon: "ri-book-read-line" },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [MAGISTRATURA_MENU_ID]: [
    {
      href: "/blog/100/magistratura-online-royxatdan-otish-2025",
      labelKey: "admission.magistratura.link.onlineRegister",
      icon: "ri-user-add-line",
    },
    {
      href: "/blog/100/qabul-nizomi-2",
      labelKey: "admission.magistratura.link.qabulNizomi",
      icon: "ri-scales-3-line",
    },
    {
      href: "/blog/100/magistratura-qabul-kvotasi-2025",
      labelKey: "admission.magistratura.link.qabulKvota",
      icon: "ri-pie-chart-line",
    },
    {
      href: "/blog/100/magistratura-qabul-hujjatlari-toplami",
      labelKey: "admission.magistratura.link.kerakliHujjatlar",
      icon: "ri-folder-3-line",
    },
    {
      href: "/blog/100/magistratura-imtihon-fanlari-royxati",
      labelKey: "admission.magistratura.link.imtihonFanlar",
      icon: "ri-book-read-line",
    },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [ORDINATURA_MENU_ID]: [
    { href: "/blog/215/hujjat-turlari", labelKey: "admission.ordinatura.link.hujjatTurlari", icon: "ri-folder-3-line" },
    { href: "/blog/215/abiturientlar-uchun-eslatma-2025", labelKey: "admission.ordinatura.link.eslatma", icon: "ri-information-line" },
    { href: "/blog/215/klinik-ordinatura-qabul-nizomi", labelKey: "admission.ordinatura.link.qabulNizomi", icon: "ri-scales-3-line" },
    { href: "/blog/215/ordinaturaga-hujjat-topshirish-2025", labelKey: "admission.ordinatura.link.hujjatTopshirish", icon: "ri-upload-cloud-2-line" },
    { href: "/blog/215/ordinatura-test-sinovi-manzillari-2025", labelKey: "admission.ordinatura.link.testManzillari", icon: "ri-map-pin-2-line" },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [QOSHMA_MENU_ID]: [
    { href: "/blog/233/kontrakt-miqdori-2025", labelKey: "admission.qoshma.link.kontrakt", icon: "ri-money-dollar-circle-line" },
    { href: "/blog/233/qabul-komissiyasi-qoshma-talim-2025", labelKey: "admission.qoshma.link.komissiya", icon: "ri-map-pin-line" },
    { href: "/blog/233/xalqaro-qoshma-talim-2025", labelKey: "admission.qoshma.link.kvota", icon: "ri-pie-chart-line" },
    { href: "/blog/233/xalqaro-qabul-hujjatlar-toplami", labelKey: "admission.qoshma.link.hujjatlar", icon: "ri-folder-3-line" },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [KOCHIRISH_MENU_ID]: [
    {
      href: "/blog/241/oqishni-kochirish-qayta-tiklash",
      labelKey: "admission.kochirish.link.qaytaTiklash",
      icon: "ri-refresh-line",
    },
    {
      href: "/blog/241/oqishni-kochirish-natijalari-2024",
      labelKey: "admission.kochirish.link.natijalar",
      icon: "ri-bar-chart-box-line",
    },
    {
      href: "/blog/241/turdosh-mutaxassisliklar-royxati",
      labelKey: "admission.kochirish.link.turdosh",
      icon: "ri-route-line",
    },
    {
      href: "/blog/241/kop-berilayotgan-savollar",
      labelKey: "admission.kochirish.link.faq",
      icon: "ri-question-answer-line",
    },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [DOKTORANTURA_MENU_ID]: [
    {
      href: "/blog/262/doktorantura-mandat-2025",
      labelKey: "admission.doktorantura.link.mandat",
      icon: "ri-award-line",
    },
    {
      href: "/blog/262/140001-akusherlik-va-ginekologiya",
      labelKey: "admission.doktorantura.link.akusherlik",
      icon: "ri-file-edit-line",
    },
    {
      href: "/blog/262/140005-ichki-kasalliklar",
      labelKey: "admission.doktorantura.link.ichkiKasalliklar",
      icon: "ri-file-edit-line",
    },
    {
      href: "/blog/262/140013-nevrologiya",
      labelKey: "admission.doktorantura.link.nevrologiya",
      icon: "ri-file-edit-line",
    },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [INTERNATURA_MENU_ID]: [
    {
      href: "/blog/375/internatura-qabul-komissiyasi-2025",
      labelKey: "admission.internatura.link.komissiya",
      icon: "ri-map-pin-line",
    },
    {
      href: "/blog/375/internaturaga-hujjat-topshirish-2025",
      labelKey: "admission.internatura.link.hujjatTopshirish",
      icon: "ri-upload-cloud-2-line",
    },
    {
      href: "/blog/375/internatura-qabul-taqsimoti-2024",
      labelKey: "admission.internatura.link.taqsimot",
      icon: "ri-pie-chart-line",
    },
    {
      href: "/blog/375/internatura-mandat-2025",
      labelKey: "admission.internatura.link.mandat",
      icon: "ri-award-line",
    },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [XORIJIY_QABUL_MENU_ID]: [
    { href: "/blog/378/bakalavriat-2025", labelKey: "admission.xorijiy.link.bakalavriat", icon: "ri-graduation-cap-line" },
    {
      href: "/blog/378/xorijiy-fuqarolar-uchun-magistratura-va-klinik-ordinatura",
      labelKey: "admission.xorijiy.link.ordinatura",
      icon: "ri-stethoscope-line",
    },
    {
      href: "/blog/378/horijiy-fuqarolar-uchun-hujjatlarni-topshirish-tartibi",
      labelKey: "admission.xorijiy.link.hujjatlar",
      icon: "ri-folder-3-line",
    },
    {
      href: "/blog/378/xorijiy-talabalar-uchun-tolov-kontrakatlar-miqdori",
      labelKey: "admission.xorijiy.link.kontrakt",
      icon: "ri-money-dollar-circle-line",
    },
    { href: "/blog/378/xorijiy-abiturientlar-uchun-mandat-2025", labelKey: "admission.xorijiy.link.mandat", icon: "ri-award-line" },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
  [TEXNIKUM_BITIRUV_MENU_ID]: [
    { href: "/blog/495/online-royxatdan-otish-2025", labelKey: "admission.texnikum.link.online", icon: "ri-user-add-line" },
    {
      href: "/blog/495/tibbiyot-texnikumlari-bitiruvchilari-uchun-qabul-komissiyasi-yangiliklari",
      labelKey: "admission.texnikum.link.yangiliklar",
      icon: "ri-newspaper-line",
    },
    {
      href: "/blog/495/tibbiyot-texnikumi-biturvchilarini-qabul-qilish-nizomi",
      labelKey: "admission.texnikum.link.nizom",
      icon: "ri-scales-3-line",
    },
    {
      href: "/blog/495/texnikumlar-uchun-qabul-komissiyasi-markazi",
      labelKey: "admission.texnikum.link.callcenter",
      icon: "ri-phone-line",
    },
    { href: "/blog/495/appelyatsiya-komissiyasi", labelKey: "admission.texnikum.link.appeal", icon: "ri-chat-check-line" },
    { href: "/qabul", labelKey: "admission.link.qabulPage", icon: "ri-graduation-cap-line" },
  ],
};

export default function AdmissionPlaceholderContent({ menuId }: { menuId: number }) {
  const { t } = useTranslation();
  const related = RELATED_BY_MENU[menuId] ?? RELATED_BY_MENU[BAKALAVRIAT_MENU_ID];

  return (
    <div className="cms-science cms-science--admission-placeholder">
      <div className="cms-admission-status">
        <span className="cms-admission-status__badge">
          <i className="ri-time-line" aria-hidden />
          {t("admission.placeholder.badge")}
        </span>
        <p className="cms-admission-status__text">{t("admission.placeholder.text")}</p>
      </div>

      <h3 className="cms-admission-related__title">{t("admission.placeholder.related")}</h3>
      <div className="cms-fundamental-links">
        {related.map((link) => (
          <Link key={link.href} to={link.href} className="cms-fundamental-link">
            <span className="cms-fundamental-link__icon" aria-hidden>
              <i className={link.icon} />
            </span>
            <span className="cms-fundamental-link__body">
              <span className="cms-fundamental-link__title">{t(link.labelKey)}</span>
            </span>
            <i className="ri-arrow-right-s-line cms-fundamental-link__arrow" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
