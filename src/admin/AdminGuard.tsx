import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminGuard() {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-100">
        <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center animate-spin text-primary-500 text-3xl" />
      </div>
    );
  }

  if (status === "unauthed") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
