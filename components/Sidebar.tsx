"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Brain, LayoutGrid, FileText, Search, 
  BarChart3, LogOut, Globe, Plus, Menu, X 
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Состояние для мобильного меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Закрываем мобильное меню при переходе по ссылке
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: LayoutGrid, label: t.sidebar.home, path: "/dashboard" },
    { icon: FileText, label: t.sidebar.myDecks, path: "/library" },
    { icon: Globe, label: t.sidebar.catalog, path: "/browse" },
    { icon: Search, label: t.sidebar.search, path: "/search" },
    { icon: BarChart3, label: t.sidebar.stats, path: "/history" },
  ];

  // Выносим содержимое сайдбара, чтобы использовать его и в десктопе, и в мобилке
  const SidebarContent = () => (
    <>
      <div>
        <div 
          onClick={() => router.push("/dashboard")}
          className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100 cursor-pointer"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shrink-0">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl lg:block tracking-tight text-slate-900">Makquiz</span>
        </div>

        <div className="p-4 pb-0">
          <button
            onClick={() => router.push("/create")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="lg:block">{t.sidebar.create}</span>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={clsx(
                "w-full flex items-center p-3 rounded-xl transition-all font-bold",
                pathname === item.path
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={clsx("w-5 h-5 shrink-0", pathname === item.path ? "text-indigo-600" : "text-slate-400")} />
              <span className="ml-3 lg:block">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* Переключатель языка */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setLanguage('ru')}
            className={clsx("flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all", language === 'ru' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400")}
          >RU</button>
          <button 
            onClick={() => setLanguage('en')}
            className={clsx("flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all", language === 'en' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400")}
          >EN</button>
        </div>
        
        <button
          onClick={() => { logout(); router.push("/auth"); }}
          className="w-full flex items-center p-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="ml-3 lg:block">{t.sidebar.logout}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* --- МОБИЛЬНАЯ ШАПКА (Видна только на md:hidden) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Brain className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">Makquiz</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- МОБИЛЬНОЕ МЕНЮ (OVERLAY) --- */}
      {/* Затемнение фона */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Выезжающая панель */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 w-64 bg-white z-[70] shadow-2xl transform transition-transform duration-300 md:hidden flex flex-col justify-between",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Кнопка закрытия внутри меню */}
        <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900"
        >
            <X className="w-5 h-5" />
        </button>
        
        <SidebarContent />
      </aside>

      {/* --- ДЕСКТОПНЫЙ САЙДБАР (Оригинальный, скрыт на mobile) --- */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 flex-col justify-between sticky top-0 h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}