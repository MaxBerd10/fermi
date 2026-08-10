import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPage } from "@/api/pages";
import type { Page } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import RichContent from "@/components/shared/RichContent";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stripHtml } from "@/lib/html";
import { Reveal } from "@/components/Animation";
import CertificateGallery from "@/components/shared/CertificateGallery";
import InstitutSidebar from "@/components/shared/InstitutSidebar";
import MenuSectionNav from "@/components/shared/MenuSectionNav";
import NewsSectionNav from "@/components/shared/NewsSectionNav";
import CouncilSectionNav from "@/components/shared/CouncilSectionNav";
import JournalSectionNav from "@/components/shared/JournalSectionNav";
import NewspaperSectionNav from "@/components/shared/NewspaperSectionNav";
import NewspaperPageContent from "@/components/shared/NewspaperPageContent";
import RegulatorySectionNav from "@/components/shared/RegulatorySectionNav";
import RegulatoryPageContent from "@/components/shared/RegulatoryPageContent";
import ConferenceSectionNav from "@/components/shared/ConferenceSectionNav";
import ConferencePageContent from "@/components/shared/ConferencePageContent";
import BuildingSectionNav from "@/components/shared/BuildingSectionNav";
import BuildingPageContent from "@/components/shared/BuildingPageContent";
import UnitPageContent from "@/components/shared/UnitPageContent";
import ScienceActivityPageContent from "@/components/shared/ScienceActivityPageContent";
import ScienceActivitySectionNav from "@/components/shared/ScienceActivitySectionNav";
import FaoliyatPageContent from "@/components/shared/FaoliyatPageContent";
import FaoliyatSectionNav from "@/components/shared/FaoliyatSectionNav";
import AdmissionPageContent from "@/components/shared/AdmissionPageContent";
import StudentPageContent from "@/components/shared/StudentPageContent";
import XorijiyPageContent from "@/components/shared/XorijiyPageContent";
import KongressPageContent from "@/components/shared/KongressPageContent";
import CouncilPdfContent from "@/components/shared/CouncilPdfContent";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import JournalAboutContent from "@/components/shared/JournalAboutContent";
import JournalArchiveContent from "@/components/shared/JournalArchiveContent";
import ReformsPageContent from "@/components/shared/ReformsPageContent";
import { getGalleryVariant } from "@/lib/parseCertificateGallery";
import { getCmsArticleModifier } from "@/lib/enhanceCmsHtml";
import AiSummaryBlock from "@/components/ai/AiSummaryBlock";
import { normalizePageSlug, normalizeYearLabels } from "@/lib/siteConstants";
import { NEWS_SECTION_MENU_ID } from "@/lib/newsSection";
import {
  COUNCIL_SECTION_MENU_ID,
  getCouncilsPageIntroKey,
  isCouncilCompactPdf,
  isCouncilPdfPage,
} from "@/lib/councilSection";
import {
  JOURNAL_SECTION_MENU_ID,
  getJournalArchiveYear,
  getJournalPageIntroKey,
  isJournalArchivePage,
  isJournalCompactPdf,
  isJournalPdfPage,
} from "@/lib/journalSection";
import {
  NEWSPAPER_SECTION_MENU_ID,
  NEWSPAPER_MAIN_SLUG,
  getNewspaperPageIntroKey,
  isNewspaperSectionPage,
} from "@/lib/newspaperSection";
import {
  REGULATORY_SECTION_MENU_ID,
  getRegulatoryPageIntroKey,
  getRegulatoryPageTitleKey,
  isRegulatorySectionPage,
} from "@/lib/regulatorySection";
import {
  CONFERENCE_SECTION_MENU_ID,
  getConferencePageIntroKey,
  getConferencePageTitleKey,
  isConferenceSectionPage,
} from "@/lib/conferenceSection";
import {
  BUILDINGS_SECTION_MENU_ID,
  getBuildingsPageIntroKey,
  getBuildingsPageTitleKey,
  getBuildingsSubView,
  isBuildingsSectionPage,
} from "@/lib/buildingsSection";
import { resolveMenuSection } from "@/lib/menuSection";
import { isUnitSectionPage } from "@/lib/unitSection";
import {
  SCIENCE_ACTIVITY_MENU_ID,
  getScienceActivityIntroKey,
  isScienceActivitySectionPage,
} from "@/lib/scienceActivitySection";
import {
  FAOLIYAT_MENU_IDS,
  getFaoliyatBreadcrumbKey,
  getFaoliyatIntroKey,
  isFaoliyatSectionPage,
} from "@/lib/faoliyatSection";
import { isAdmissionSectionPage } from "@/lib/admissionSection";
import { isStudentSectionPage } from "@/lib/studentSection";
import { isXorijiySectionPage } from "@/lib/xorijiySection";
import { isKongressSectionPage } from "@/lib/kongressSection";
import { useMenu } from "@/context/MenuContext";

const SPECIAL_SECTION_IDS = new Set([
  NEWS_SECTION_MENU_ID,
  COUNCIL_SECTION_MENU_ID,
  JOURNAL_SECTION_MENU_ID,
  NEWSPAPER_SECTION_MENU_ID,
  REGULATORY_SECTION_MENU_ID,
  CONFERENCE_SECTION_MENU_ID,
  BUILDINGS_SECTION_MENU_ID,
  SCIENCE_ACTIVITY_MENU_ID,
  ...FAOLIYAT_MENU_IDS,
]);

export default function BlogPage() {
  const { t, i18n } = useTranslation();
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const [searchParams] = useSearchParams();
  const buildingsSubView = getBuildingsSubView(searchParams);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedMenuId = menuId ? Number(menuId) : undefined;
  const { menu: menuTree } = useMenu();

  const menuSection = useMemo(() => {
    if (!resolvedMenuId || SPECIAL_SECTION_IDS.has(resolvedMenuId)) return null;
    return resolveMenuSection(menuTree, resolvedMenuId, slug);
  }, [menuTree, resolvedMenuId, slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getPage(normalizePageSlug(slug), resolvedMenuId)
      .then(setPage)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId, i18n.language]);

  usePageMeta(page?.title, page ? stripHtml(page.content).slice(0, 160) : null);

  if (loading) return <LoadingState />;
  if (error || !page) return <ErrorState message={error ?? undefined} />;

  const isNewsSection = resolvedMenuId === NEWS_SECTION_MENU_ID;
  const isCouncilSection = resolvedMenuId === COUNCIL_SECTION_MENU_ID;
  const isJournalSection = resolvedMenuId === JOURNAL_SECTION_MENU_ID;
  const isNewspaperSection = resolvedMenuId === NEWSPAPER_SECTION_MENU_ID;
  const isRegulatorySection = resolvedMenuId === REGULATORY_SECTION_MENU_ID;
  const isConferenceSection = resolvedMenuId === CONFERENCE_SECTION_MENU_ID;
  const isBuildingSection = resolvedMenuId === BUILDINGS_SECTION_MENU_ID;
  const isScienceActivitySection = isScienceActivitySectionPage(resolvedMenuId);
  const isFaoliyatSection = isFaoliyatSectionPage(resolvedMenuId);
  const isAdmissionSection = isAdmissionSectionPage(resolvedMenuId);
  const isStudentSection = isStudentSectionPage(resolvedMenuId);
  const isXorijiySection = isXorijiySectionPage(resolvedMenuId);
  const isKongressSection = isKongressSectionPage(resolvedMenuId, slug);
  const isUnitSection = isUnitSectionPage(resolvedMenuId);
  const hasMenuSectionNav = Boolean(menuSection);
  const hasInstitutSidebar =
    Boolean(page.menu?.subMenus?.length) &&
    !isNewsSection &&
    !isCouncilSection &&
    !isJournalSection &&
    !isNewspaperSection &&
    !isRegulatorySection &&
    !isConferenceSection &&
    !isBuildingSection &&
    !isScienceActivitySection &&
    !isFaoliyatSection &&
    !hasMenuSectionNav;
  const hasSidebar =
    hasInstitutSidebar ||
    hasMenuSectionNav ||
    isNewsSection ||
    isCouncilSection ||
    isJournalSection ||
    isNewspaperSection ||
    isRegulatorySection ||
    isConferenceSection ||
    isBuildingSection ||
    isScienceActivitySection ||
    isFaoliyatSection;

  const displayTitle = (() => {
    const regulatoryTitleKey = getRegulatoryPageTitleKey(slug);
    if (isRegulatorySection && regulatoryTitleKey) return t(regulatoryTitleKey);
    const conferenceTitleKey = getConferencePageTitleKey(slug);
    if (isConferenceSection && conferenceTitleKey) return t(conferenceTitleKey);
    const buildingsTitleKey = getBuildingsPageTitleKey(slug, buildingsSubView);
    if (isBuildingSection && buildingsTitleKey) return t(buildingsTitleKey);
    return normalizeYearLabels(page.title);
  })();
  const isInstitutAbout = slug === "institut-xaqida";
  const galleryVariant = getGalleryVariant(slug, page.content);
  const isGalleryPage = galleryVariant !== null && !isBuildingsSectionPage(slug);
  const cmsModifier = getCmsArticleModifier(slug);
  const isReformsPage = slug === "tibbiyotdagi-islohotlar-inson-qadri-uchun";
  const reformsOnly = isReformsPage && !stripHtml(page.content).trim();

  const councilPdfOnly = isCouncilPdfPage(slug) && Boolean(page.file) && !stripHtml(page.content).trim();
  const councilIntroKey = getCouncilsPageIntroKey(slug);
  const councilCompactPdf = isCouncilCompactPdf(slug);
  const showCouncilPdf =
    isCouncilSection &&
    Boolean(page.file) &&
    (councilPdfOnly || slug === "ilmiy-kengash" || slug === "kengash-kun-tartibi");

  const journalIntroKey = getJournalPageIntroKey(slug);
  const journalCompactPdf = isJournalCompactPdf(slug);
  const journalAboutPage = slug === "jurnal-xaqida";
  const journalArchivePage = isJournalArchivePage(slug);
  const journalSamplePage = slug === "maqola-namunasi";
  const journalPdfOnly =
    isJournalPdfPage(slug) &&
    Boolean(page.file) &&
    !journalAboutPage &&
    !journalSamplePage &&
    (!stripHtml(page.content).trim() || slug === "klinik-va-profilaktik-tibbiyot-jurnali");
  const showJournalPdf =
    isJournalSection && Boolean(page.file) && !journalPdfOnly && slug === "tahrir-hayati-kengashi";

  const newspaperIntroKey = getNewspaperPageIntroKey(slug);
  const regulatoryIntroKey = getRegulatoryPageIntroKey(slug);
  const conferenceIntroKey = getConferencePageIntroKey(slug);
  const buildingsIntroKey = getBuildingsPageIntroKey(slug, buildingsSubView);

  const scienceIntroKey = getScienceActivityIntroKey(slug);
  const faoliyatIntroKey = getFaoliyatIntroKey(slug, resolvedMenuId);
  const sectionIntroKey =
    councilIntroKey ??
    (journalAboutPage ? null : journalIntroKey) ??
    (slug === NEWSPAPER_MAIN_SLUG ? null : newspaperIntroKey) ??
    regulatoryIntroKey ??
    conferenceIntroKey ??
    buildingsIntroKey ??
    scienceIntroKey ??
    faoliyatIntroKey ??
    menuSection?.introKey;

  const hideAi =
    isGalleryPage ||
    hasMenuSectionNav ||
    isUnitSection ||
    slug === "usmle-dasturi" ||
    reformsOnly ||
    slug === "ichki-tartib-qoidalar" ||
    councilPdfOnly ||
    journalPdfOnly ||
    slug === "avtoreferatlar" ||
    isJournalArchivePage(slug) ||
    isNewspaperSectionPage(slug) ||
    isRegulatorySectionPage(slug) ||
    isConferenceSectionPage(slug) ||
    isBuildingsSectionPage(slug) ||
    isScienceActivitySection ||
    isFaoliyatSection ||
    isKongressSection;

  const breadcrumb = isNewsSection
    ? t("news.title")
    : isCouncilSection
      ? t("council.breadcrumb")
      : isJournalSection
        ? t("journal.breadcrumb")
        : isNewspaperSection
          ? t("newspaper.breadcrumb")
          : isRegulatorySection
            ? t("regulatory.breadcrumb")
            : isConferenceSection
              ? t("conference.breadcrumb")
              : isBuildingSection
                ? t("buildings.breadcrumb")
                : isScienceActivitySection
                  ? t("nav.section.ilmiyFaoliyat")
                  : isFaoliyatSection && getFaoliyatBreadcrumbKey(resolvedMenuId)
                    ? t(getFaoliyatBreadcrumbKey(resolvedMenuId)!)
                    : menuSection
                  ? t(menuSection.breadcrumbKey)
                  : page.menu?.title
          ? normalizeYearLabels(page.menu.title)
          : t("footer.institutHaqida");

  const pdfCompact = councilCompactPdf || journalCompactPdf;

  return (
    <div className="text-foreground-950">
      <PageHeader title={displayTitle} breadcrumb={breadcrumb} compact />

      <section className="section-pad !pt-3 md:!pt-4 bg-transparent">
        <div
          className={`section-container grid gap-5 lg:gap-6 items-start ${hasSidebar ? "lg:grid-cols-12" : ""}`}
        >
          <div className={hasSidebar ? "lg:col-span-8 min-w-0" : "min-w-0"}>
            {sectionIntroKey && !isUnitSection && !isFaoliyatSection && !isAdmissionSection && !isStudentSection && !isXorijiySection && !isKongressSection && (
              <Reveal>
                <p
                  className={
                    isJournalSection
                      ? "journal-section__intro"
                      : isNewspaperSection
                        ? "newspaper-section__intro"
                        : isRegulatorySection
                          ? "regulatory-section__intro"
                          : isConferenceSection
                            ? "conference-section__intro"
                            : isBuildingSection
                              ? "buildings-section__intro"
                              : isScienceActivitySection || isFaoliyatSection
                                ? "science-section__intro"
                                : hasMenuSectionNav
                                  ? "menu-section__intro"
                                  : "council-section__intro"
                  }
                >
                  {t(sectionIntroKey)}
                </p>
              </Reveal>
            )}

            <Reveal>
              {isUnitSection && slug ? (
                <UnitPageContent page={page} slug={slug} title={displayTitle} />
              ) : isScienceActivitySection && slug ? (
                <article className="page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
                  <ScienceActivityPageContent slug={slug} html={page.content} pdfUrl={page.file} />
                </article>
              ) : isAdmissionSection && slug && resolvedMenuId ? (
                <AdmissionPageContent
                  menuId={resolvedMenuId}
                  slug={slug}
                  html={page.content}
                  pdfUrl={page.file}
                  title={displayTitle}
                />
              ) : isStudentSection && slug && resolvedMenuId ? (
                <StudentPageContent
                  menuId={resolvedMenuId}
                  slug={slug}
                  html={page.content}
                  pdfUrl={page.file}
                  title={displayTitle}
                />
              ) : isXorijiySection && slug ? (
                <XorijiyPageContent
                  slug={slug}
                  html={page.content}
                  pdfUrl={page.file}
                  title={displayTitle}
                />
              ) : isKongressSection && slug ? (
                <KongressPageContent
                  slug={slug}
                  html={page.content}
                  pdfUrl={page.file}
                  title={displayTitle}
                />
              ) : isFaoliyatSection && slug && resolvedMenuId ? (
                <FaoliyatPageContent
                  menuId={resolvedMenuId}
                  slug={slug}
                  html={page.content}
                  pdfUrl={page.file}
                  title={displayTitle}
                />
              ) : (
              <article
                className={`page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6 cms-article cms-article--rich${hasMenuSectionNav ? " cms-article--menu-section" : ""}${isInstitutAbout ? " cms-article--about" : ""}${cmsModifier ? ` ${cmsModifier}` : ""}${isGalleryPage ? ` cms-article--gallery cms-article--${galleryVariant}` : ""}`}
              >
                {isGalleryPage ? (
                  <CertificateGallery html={page.content} slug={slug} />
                ) : reformsOnly ? (
                  <ReformsPageContent pdfUrl={page.file} />
                ) : isBuildingsSectionPage(slug) ? (
                  <BuildingPageContent
                    slug={slug}
                    html={page.content}
                    featuredImage={page.file}
                    subView={buildingsSubView}
                  />
                ) : isConferenceSectionPage(slug) ? (
                  <ConferencePageContent html={page.content} slug={slug} pdfUrl={page.file} />
                ) : isRegulatorySectionPage(slug) ? (
                  <RegulatoryPageContent html={page.content} slug={slug} pdfUrl={page.file} />
                ) : isNewspaperSectionPage(slug) ? (
                  <NewspaperPageContent html={page.content} slug={slug} pdfUrl={page.file} />
                ) : journalAboutPage ? (
                  <JournalAboutContent pdfUrl={page.file} />
                ) : journalArchivePage ? (
                  <JournalArchiveContent html={page.content} year={getJournalArchiveYear(slug)!} />
                ) : journalSamplePage && page.file ? (
                  <PdfDocumentViewer pdfUrl={page.file} title={displayTitle} interactive />
                ) : (councilPdfOnly || journalPdfOnly) && page.file ? (
                  <CouncilPdfContent pdfUrl={page.file} title={displayTitle} compact={pdfCompact} />
                ) : (
                  <RichContent
                    html={page.content}
                    slug={slug}
                    className={`cms-article cms-article--rich${hasMenuSectionNav ? " cms-article--menu-section" : ""}${isInstitutAbout ? " cms-article--about" : ""}${cmsModifier ? ` ${cmsModifier}` : ""}`}
                  />
                )}
              </article>
              )}
            </Reveal>

            {showCouncilPdf && page.file && !councilPdfOnly && (
              <Reveal delay={80}>
                <div className="mt-5 page-card px-5 py-4 md:px-7 md:py-5">
                  <CouncilPdfContent pdfUrl={page.file} title={displayTitle} compact={pdfCompact} />
                </div>
              </Reveal>
            )}

            {showJournalPdf && page.file && (
              <Reveal delay={80}>
                <div className="mt-5 page-card px-5 py-4 md:px-7 md:py-5">
                  <CouncilPdfContent pdfUrl={page.file} title={displayTitle} compact={pdfCompact} />
                </div>
              </Reveal>
            )}

            {!hideAi && (
              <Reveal delay={60}>
                <AiSummaryBlock title={displayTitle} content={page.content} className="mt-4" />
              </Reveal>
            )}

            {page.file && !reformsOnly && !isCouncilSection && !isJournalSection && !isNewspaperSection && !isRegulatorySection && !isConferenceSection && !isBuildingSection && !isUnitSection && !isScienceActivitySection && !isFaoliyatSection && !isAdmissionSection && !isStudentSection && !isXorijiySection && !isKongressSection && (
              <Reveal delay={80}>
                <a
                  href={page.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold transition-colors shadow-md"
                >
                  <i
                    className={
                      slug === "ecaqa-xalqaro-maxsus-akkreditatsiya" ? "ri-file-pdf-line" : "ri-file-download-line"
                    }
                  />
                  {slug === "ecaqa-xalqaro-maxsus-akkreditatsiya"
                    ? t("accreditation.downloadPdf")
                    : t("common.downloadFile")}
                </a>
              </Reveal>
            )}

            {page.file && slug === "avtoreferatlar" && !isScienceActivitySection && !isFaoliyatSection && (
              <Reveal delay={100}>
                <a
                  href={page.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold transition-colors shadow-md"
                >
                  <i className="ri-file-pdf-line" />
                  {t("council.downloadAutoreferatArchive")}
                </a>
              </Reveal>
            )}

            {page.leaders.length > 0 && !isUnitSection && (
              <Reveal delay={120}>
                <div className="mt-10 space-y-4">
                  <h2 className="font-heading text-xl font-bold text-[#0a1158]">{t("blog.leaders")}</h2>
                  {page.leaders.map((l, i) => (
                    <Reveal key={l.id} delay={140 + i * 60}>
                      <div className="flex gap-4 p-4 md:p-5 page-card hover:border-primary-200 transition-all">
                        {l.photo && (
                          <img
                            src={l.photo}
                            alt={l.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-heading font-semibold text-slate-900">{l.name}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{l.position}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {hasSidebar && (
            <aside className="lg:col-span-4 min-w-0">
              <Reveal delay={100}>
                {isNewsSection ? (
                  <NewsSectionNav currentSlug={slug} />
                ) : isCouncilSection ? (
                  <CouncilSectionNav currentSlug={slug} />
                ) : isJournalSection ? (
                  <JournalSectionNav currentSlug={slug} />
                ) : isNewspaperSection ? (
                  <NewspaperSectionNav currentSlug={slug} />
                ) : isRegulatorySection ? (
                  <RegulatorySectionNav currentSlug={slug} />
                ) : isConferenceSection ? (
                  <ConferenceSectionNav currentSlug={slug} />
                ) : isBuildingSection ? (
                  <BuildingSectionNav currentSlug={slug} />
                ) : isScienceActivitySection ? (
                  <ScienceActivitySectionNav currentSlug={slug} />
                ) : isFaoliyatSection && resolvedMenuId ? (
                  <FaoliyatSectionNav menuId={resolvedMenuId} currentSlug={slug} />
                ) : hasMenuSectionNav && resolvedMenuId ? (
                  <MenuSectionNav menuId={resolvedMenuId} currentSlug={slug} />
                ) : (
                  page.menu && (
                    <InstitutSidebar
                      menuId={page.menu.id}
                      menuTitle={page.menu.title}
                      subMenus={page.menu.subMenus}
                      currentSlug={slug ?? ""}
                    />
                  )
                )}
              </Reveal>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
