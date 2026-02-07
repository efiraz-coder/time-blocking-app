"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  FileText,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  Timer,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "ראשי", icon: LayoutDashboard },
  { href: "/plan", label: "תכנון שבועי", icon: Calendar },
  { href: "/report/0", label: "דיווח יומי", icon: FileText },
  { href: "/summary", label: "סיכום שבועי", icon: BarChart3 },
  { href: "/history", label: "היסטוריה", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border/30">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-apple shrink-0">
          <Timer className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-foreground animate-fade-in">
            תכנון שבועי
          </span>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden mr-auto p-1 rounded-lg hover:bg-accent transition-apple"
          aria-label="סגור תפריט"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/report/0" && pathname?.startsWith("/report"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-apple group",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-apple",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex mx-3 mb-4 p-2.5 rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground transition-apple items-center justify-center"
        aria-label={collapsed ? "הרחב תפריט" : "כווץ תפריט"}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-apple"
        aria-label="פתח תפריט"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 right-0 h-screen w-[260px] bg-white/95 glass border-l border-border/50 flex flex-col z-50 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex sticky top-0 h-screen bg-white/80 glass border-l border-border/50 flex-col transition-all duration-300 ease-in-out z-50",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
