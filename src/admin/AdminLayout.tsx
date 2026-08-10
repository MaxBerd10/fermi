import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "@/api/auth";
import { useAdminAuth } from "./AdminAuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "",
    items: [
      { to: "/admin", label: "Boshqaruv paneli", icon: "ri-dashboard-line" },
      { to: "/admin/menu-tree", label: "Menyu daraxti", icon: "ri-list-check-2" },
      { to: "/admin/users", label: "Foydalanuvchilar", icon: "ri-user-settings-line" },
    ],
  },
  {
    label: "Kontent",
    items: [
      { to: "/admin/news", label: "Yangiliklar", icon: "ri-newspaper-line" },
      { to: "/admin/pages", label: "Sahifalar", icon: "ri-file-text-line" },
      { to: "/admin/about", label: "Institut haqida", icon: "ri-information-line" },
      { to: "/admin/gallery-images", label: "Foto galereya", icon: "ri-image-line" },
      { to: "/admin/videos", label: "Video", icon: "ri-video-line" },
      { to: "/admin/corusel", label: "Bosh sahifa banneri", icon: "ri-slideshow-line" },
    ],
  },
  {
    label: "Tuzilma",
    items: [
      { to: "/admin/faculty", label: "Fakultetlar", icon: "ri-building-line" },
      { to: "/admin/departments", label: "Kafedralar", icon: "ri-building-2-line" },
      { to: "/admin/leaders", label: "Rahbariyat", icon: "ri-team-line" },
      { to: "/admin/leadercategories", label: "Rahbariyat toifalari", icon: "ri-price-tag-3-line" },
    ],
  },
  {
    label: "Hujjatlar",
    items: [
      { to: "/admin/documents", label: "Hujjatlar to'plami", icon: "ri-folder-line" },
      { to: "/admin/documents-items", label: "Hujjat elementlari", icon: "ri-file-list-line" },
      { to: "/admin/courses", label: "Kurslar", icon: "ri-book-line" },
      { to: "/admin/schedules", label: "Dars jadvali", icon: "ri-calendar-line" },
    ],
  },
  {
    label: "Murojaatlar",
    items: [
      { to: "/admin/contacts", label: "Aloqa formasi", icon: "ri-mail-line" },
      { to: "/admin/acceptances", label: "Qabul arizalari", icon: "ri-file-edit-line" },
      { to: "/admin/virtual-submissions", label: "Virtual qabulxona", icon: "ri-user-voice-line" },
      { to: "/admin/connect-leaders", label: "Aloqa mas'ullari", icon: "ri-contacts-line" },
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      { to: "/admin/networks", label: "Ijtimoiy tarmoqlar", icon: "ri-share-line" },
      { to: "/admin/useful-sites", label: "Foydali havolalar", icon: "ri-links-line" },
      { to: "/admin/counter", label: "Statistika", icon: "ri-bar-chart-line" },
      { to: "/admin/setting", label: "Umumiy sozlamalar", icon: "ri-settings-3-line" },
      { to: "/admin/logo", label: "Logotip", icon: "ri-shield-star-line" },
      { to: "/admin/translations", label: "Tarjimalar (UI)", icon: "ri-translate-2" },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();

  async function onLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-background-100">
      <aside className="w-64 shrink-0 bg-background-50 border-r border-background-200 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-background-200">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-background-50 font-bold text-sm">F</div>
          <span className="font-heading font-bold text-foreground-950">FJSTI Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground-400">{group.label}</div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-foreground-600 hover:bg-background-100 hover:text-foreground-900"
                      }`
                    }
                  >
                    <i className={`${item.icon} w-5 h-5 flex items-center justify-center text-base`} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-background-200">
          <div className="px-3 py-2 text-xs text-foreground-500">
            <div className="font-medium text-foreground-800">{user?.username}</div>
            <div>{user?.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground-600 hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-logout-box-line w-5 h-5 flex items-center justify-center" />
            Chiqish
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 bg-background-50 border-b border-background-200 flex items-center px-6">
          <a href="/" target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1.5">
            <i className="ri-external-link-line w-4 h-4 flex items-center justify-center" />
            Saytni ko'rish
          </a>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
