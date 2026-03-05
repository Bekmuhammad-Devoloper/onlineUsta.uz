"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import {
  Wrench, Bell, LogOut, LogIn, UserPlus, Home,
  LayoutGrid, ClipboardList, User, BarChart3, Settings,
  Users, Briefcase, Moon, Sun,
} from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Don't render on landing page, auth pages, or admin pages (admin has its own sidebar layout)
  if (pathname === "/" || pathname.startsWith("/auth/") || pathname.startsWith("/admin")) return null;

  const isAdmin = user?.role === "ADMIN";
  const isMaster = user?.role === "MASTER";

  // Bottom tab links (max 5 for mobile)
  const tabLinks = isAdmin
    ? [
        { href: "/admin", label: "Bosh sahifa", icon: Home },
        { href: "/admin/orders", label: "Buyurtmalar", icon: ClipboardList },
        { href: "/admin/masters", label: "Ustalar", icon: Wrench },
        { href: "/admin/users", label: "Userlar", icon: Users },
        { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
      ]
    : isMaster
    ? [
        { href: "/master", label: "Bosh sahifa", icon: Home },
        { href: "/master/orders", label: "Buyurtmalar", icon: ClipboardList },
        { href: "/master/available", label: "Mavjud", icon: Briefcase },
        { href: "/master/stats", label: "Statistika", icon: BarChart3 },
        { href: "/master/profile", label: "Profil", icon: User },
      ]
    : user
    ? [
        { href: "/home", label: "Bosh sahifa", icon: Home },
        { href: "/categories", label: "Kategoriyalar", icon: LayoutGrid },
        { href: "/orders", label: "Buyurtmalar", icon: ClipboardList },
        { href: "/notifications", label: "Xabarlar", icon: Bell },
        { href: "/profile", label: "Profil", icon: User },
      ]
    : [
        { href: "/home", label: "Bosh sahifa", icon: Home },
        { href: "/categories", label: "Kategoriyalar", icon: LayoutGrid },
        { href: "/orders", label: "Buyurtmalar", icon: ClipboardList },
        { href: "/notifications", label: "Xabarlar", icon: Bell },
        { href: "/auth/login", label: "Kirish", icon: LogIn },
      ];

  return (
    <>
      {/* ====== TOP HEADER ====== */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            {/* Logo */}
            <Link href={isAdmin ? "/admin" : isMaster ? "/master" : "/home"} className="flex items-center gap-2">
              <Logo size="md" showText={true} />
            </Link>

            {/* Right side — Theme toggle + Avatar + Name or Login buttons */}
            <div className="flex items-center gap-2">
              {/* Dark/Light mode toggle */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title={theme === "dark" ? "Yorug' rejim" : "Qorong'u rejim"}
              >
                {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-2.5">
                  {/* Notifications (desktop only) */}
                  <Link
                    href="/notifications"
                    className="hidden md:flex relative w-8 h-8 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Bell className="w-4.5 h-4.5" />
                  </Link>

                  {/* Avatar + Name */}
                  <Link href="/profile" className="flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                        {user.name ? (
                          <span>{user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                      {user.name || user.phone}
                    </span>
                  </Link>

                  {/* Logout (desktop) */}
                  <button
                    onClick={logout}
                    className="hidden md:flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition"
                    title="Chiqish"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-medium transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Kirish</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Ro&apos;yxatdan o&apos;tish</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ====== BOTTOM TAB BAR (Always visible) ====== */}
      {tabLinks.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto flex items-center justify-around h-16 px-1">
            {tabLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <div className={`p-1 rounded-full transition ${isActive ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}>
                    <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  </div>
                  <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Safe area for phones with gesture bar */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      )}

      {/* Bottom spacer so content doesn't hide behind tab bar */}
      {tabLinks.length > 0 && (
        <div className="h-16" />
      )}
    </>
  );
}
