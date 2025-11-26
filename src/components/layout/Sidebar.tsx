import { useState, type ComponentType } from "react";
import {
  HomeIcon,
  FolderIcon,
  FileTextIcon,
  AwardIcon,
  UsersIcon,
  ActivityIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{
    className?: string;
  }>;
  roles?: string[];
}
export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navItems: NavItem[] = [
    {
      label: "داشبورد",
      path: `/${user?.role}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: "پروژه‌ها",
      path: "/projects",
      icon: FolderIcon,
    },
    {
      label: "مدارک",
      path: "/documents",
      icon: FileTextIcon,
      roles: ["expert", "manager"],
    },
    {
      label: "گواهی‌ها",
      path: "/certificates",
      icon: AwardIcon,
    },
    {
      label: "کاربران",
      path: "/admin/users",
      icon: UsersIcon,
      roles: ["admin"],
    },
    {
      label: "گزارش فعالیت",
      path: "/admin/audit-logs",
      icon: ActivityIcon,
      roles: ["admin"],
    },
  ];
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "")
  );
  const isActive = (path: string) => location.pathname === path;
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600 mb-4">
              سامانه تأیید طرح آسیا
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === "expert" && "کارشناس فنی"}
                  {user?.role === "manager" && "مدیر"}
                  {user?.role === "admin" && "ادمین"}
                  {user?.role === "client" && "مشتری"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
            >
              <LogOutIcon className="w-5 h-5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
