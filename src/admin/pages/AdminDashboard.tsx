import { Link } from "react-router-dom";
import { useAdminAuth } from "../AdminAuthContext";

const CARDS = [
  { to: "/admin/news", label: "Yangiliklar", icon: "ri-newspaper-line", desc: "Yangilik va e'lonlarni boshqarish" },
  { to: "/admin/pages", label: "Sahifalar", icon: "ri-file-text-line", desc: "Statik CMS sahifalarini boshqarish" },
];

export default function AdminDashboard() {
  const { user } = useAdminAuth();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-1">Xush kelibsiz, {user?.username}</h1>
      <p className="text-sm text-foreground-500 mb-8">FJSTI boshqaruv paneli — kerakli bo'limni tanlang.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-background-50 border border-background-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center text-xl mb-3">
              <i className={card.icon} />
            </div>
            <div className="font-semibold text-foreground-900">{card.label}</div>
            <div className="text-sm text-foreground-500 mt-1">{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
