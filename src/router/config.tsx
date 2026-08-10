import type { RouteObject } from "react-router-dom";
import Layout from "../components/feature/Layout";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Yangiliklar from "../pages/yangiliklar/page";
import Aloqa from "../pages/aloqa/page";
import Qabul from "../pages/qabul/page";
import Institut from "../pages/institut/page";
import VirtualQabulxona from "../pages/virtual-qabulxona/page";
import BlogPage from "../pages/blog/page";
import LeaderPage from "../pages/leader/page";
import FacultyPage from "../pages/faculty/page";
import DepartmentPage from "../pages/departments/page";
import DocumentsPage from "../pages/documents/page";
import NewsCategoryPage from "../pages/news/page";
import DetailPage from "../pages/detail/page";
import AboutPage from "../pages/about/page";
import RedesignPreviewPage from "../pages/redesign-preview/page";
import GaleryaPage from "../pages/galereya/page";
import FullGalleryPage from "../pages/full-gallery/page";
import VideoPage from "../pages/video/page";
import SchedulePage from "../pages/schedule/page";
import SearchPage from "../pages/search/page";
import SitemapPage from "../pages/sitemap/page";
import LoginPage from "../pages/auth/login/page";
import SignupPage from "../pages/auth/signup/page";
import PasswordResetPage from "../pages/auth/password-reset/page";
import VerifyEmailPage from "../pages/auth/verify-email/page";
import { AdminAuthProvider } from "../admin/AdminAuthContext";
import AdminGuard from "../admin/AdminGuard";
import AdminLayout from "../admin/AdminLayout";
import AdminLoginPage from "../admin/pages/AdminLoginPage";
import AdminDashboard from "../admin/pages/AdminDashboard";
import NewsListPage from "../admin/pages/news/NewsListPage";
import NewsFormPage from "../admin/pages/news/NewsFormPage";
import PagesListPage from "../admin/pages/pages/PagesListPage";
import PagesFormPage from "../admin/pages/pages/PagesFormPage";
import GenericListPage from "../admin/components/GenericListPage";
import GenericFormPage from "../admin/components/GenericFormPage";
import SingletonFormPage from "../admin/components/SingletonFormPage";
import { ALL_ENTITY_CONFIGS, SINGLETON_CONFIGS } from "../admin/entityConfigs";
import MenuTreePage from "../admin/pages/menu/MenuTreePage";
import UserListPage from "../admin/pages/users/UserListPage";
import UserFormPage from "../admin/pages/users/UserFormPage";

const routes: RouteObject[] = [
  // Standalone design-concept preview — deliberately outside <Layout/> so
  // it doesn't inherit the current Navbar/Footer while the client evaluates
  // the new visual direction. Not linked from anywhere in real navigation.
  { path: "/yangi-dizayn", element: <RedesignPreviewPage /> },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },

      { path: "/yangiliklar", element: <Yangiliklar /> },
      { path: "/aloqa", element: <Aloqa /> },
      { path: "/aloqa/:sub", element: <Aloqa /> },
      { path: "/qabul", element: <Qabul /> },
      { path: "/qabul/:type", element: <Qabul /> },
      { path: "/institut", element: <Institut /> },
      { path: "/institut/:sub", element: <Institut /> },
      { path: "/virtual-qabulxona", element: <VirtualQabulxona /> },

      // Legacy urlManager-matching routes (kept for SEO — see approved plan)
      { path: "/blog/:menuId/:slug", element: <BlogPage /> },
      { path: "/leader/:menuId/:slug", element: <LeaderPage /> },
      { path: "/faculty/:menuId/:slug", element: <FacultyPage /> },
      { path: "/departments/:menuId/:slug", element: <DepartmentPage /> },
      { path: "/documents/:menuId/:slug", element: <DocumentsPage /> },
      { path: "/news/:menuId/:slug", element: <NewsCategoryPage /> },
      { path: "/detail/:slug", element: <DetailPage /> },
      { path: "/about/:slug", element: <AboutPage /> },
      { path: "/virtual-reception/:menuId", element: <VirtualQabulxona /> },
      { path: "/galereya", element: <GaleryaPage /> },
      { path: "/full-gallery/:id", element: <FullGalleryPage /> },
      { path: "/video", element: <VideoPage /> },
      { path: "/schedule", element: <SchedulePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/sitemap", element: <SitemapPage /> },

      // Auth
      { path: "/kirish", element: <LoginPage /> },
      { path: "/royxatdan-otish", element: <SignupPage /> },
      { path: "/parolni-tiklash", element: <PasswordResetPage /> },
      { path: "/parolni-tiklash/:token", element: <PasswordResetPage /> },
      { path: "/email-tasdiqlash/:token", element: <VerifyEmailPage /> },

      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminAuthProvider><AdminLoginPage /></AdminAuthProvider>,
  },
  {
    path: "/admin",
    element: <AdminAuthProvider><AdminGuard /></AdminAuthProvider>,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "news", element: <NewsListPage /> },
          { path: "news/new", element: <NewsFormPage /> },
          { path: "news/:id", element: <NewsFormPage /> },
          { path: "pages", element: <PagesListPage /> },
          { path: "pages/new", element: <PagesFormPage /> },
          { path: "pages/:id", element: <PagesFormPage /> },

          ...ALL_ENTITY_CONFIGS.flatMap((config) => [
            { path: config.resource, element: <GenericListPage config={config} /> },
            { path: `${config.resource}/new`, element: <GenericFormPage config={config} /> },
            { path: `${config.resource}/:id`, element: <GenericFormPage config={config} /> },
          ]),

          ...SINGLETON_CONFIGS.map((config) => ({
            path: config.resource,
            element: <SingletonFormPage config={config} />,
          })),

          { path: "menu-tree", element: <MenuTreePage /> },

          { path: "users", element: <UserListPage /> },
          { path: "users/new", element: <UserFormPage /> },
          { path: "users/:id", element: <UserFormPage /> },
        ],
      },
    ],
  },
];

export default routes;
