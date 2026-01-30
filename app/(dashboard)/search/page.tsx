"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Search as SearchIcon, Loader2, ArrowLeft, 
  BookOpen, User, Sparkles, Filter, 
  TrendingUp, Clock, Globe 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function SearchPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, popular, recent

  // Эффект для поиска "на лету" с задержкой (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else if (query.length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Можно добавить параметры фильтрации в URL в будущем
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/search?q=${query}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Сортировка на клиенте для "крутости" в зависимости от таба
      let sortedData = [...data];
      if (activeTab === "popular") {
        sortedData.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
      }

      setResults(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-10 relative overflow-hidden">
      
      {/* Декоративный фон */}
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
        <Sparkles className="w-64 h-64 text-indigo-600" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Хедер */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="p-3 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl shadow-sm transition-all border border-slate-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Поиск колод</h1>
              <p className="text-slate-500 font-medium">Найди идеальную колоду для изучения</p>
            </div>
          </div>
        </header>

        {/* Поисковая панель */}
        <section className="mb-8">
          <div className="relative group">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: Английский B2, Анатомия, JavaScript..." 
              className="w-full h-20 pl-16 pr-6 rounded-[2rem] border-2 text-slate-900 border-transparent bg-white shadow-2xl shadow-indigo-100 text-xl font-medium focus:ring-0 focus:border-indigo-500 outline-none transition-all"
            />
            <SearchIcon className="absolute left-6 top-7 w-7 h-7 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            
            {loading && (
              <div className="absolute right-6 top-7">
                <Loader2 className="animate-spin text-indigo-500 w-6 h-6" />
              </div>
            )}
          </div>

          {/* Быстрые фильтры/табы */}
          <div className="flex gap-3 mt-6">
            <FilterTab 
              label="Все" 
              icon={Globe} 
              active={activeTab === "all"} 
              onClick={() => setActiveTab("all")} 
            />
            <FilterTab 
              label="Популярные" 
              icon={TrendingUp} 
              active={activeTab === "popular"} 
              onClick={() => setActiveTab("popular")} 
            />
            <FilterTab 
              label="Новые" 
              icon={Clock} 
              active={activeTab === "recent"} 
              onClick={() => setActiveTab("recent")} 
            />
          </div>
        </section>

        {/* Результаты поиска */}
        <main>
          <AnimatePresence mode="wait">
  {loading && results.length === 0 ? (
    <motion.div 
      key="loading" // Уникальный ключ для блока загрузки
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Исправленные уникальные ключи здесь */}
      {[1, 2, 3, 4].map((i) => <SkeletonCard key={`skeleton-${i}`} />)}
    </motion.div>
  ) : results.length > 0 ? (
    <motion.div 
      key="results" // Уникальный ключ для блока результатов
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {results.map((deck) => (
        <DeckSearchResultCard key={String(deck.id || deck._id)} deck={deck} router={router} />
      ))}
    </motion.div>
  ) : query.length > 2 ? (
    <motion.div 
      key="empty" // Уникальный ключ для блока "Ничего не найдено"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        <SearchIcon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Ничего не найдено</h3>
      <p className="text-slate-500">Попробуй изменить запрос или категорию</p>
    </motion.div>
  ) : (
    <motion.div key="initial" className="text-center py-20 opacity-30 grayscale">
       {/* Не забудьте проверить наличие этого файла в /public */}
       <p className="text-lg font-bold">Начни вводить название темы...</p>
    </motion.div>
  )}
</AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function FilterTab({ label, icon: Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
          : "bg-white text-slate-500 hover:bg-indigo-50 border border-slate-100"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function DeckSearchResultCard({ deck, router }: any) {
  const deckId = deck.id || deck._id;
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      onClick={() => router.push(`/study/${deckId}`)}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl cursor-pointer border border-slate-100 hover:border-indigo-200 transition-all group flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {deck.total_cards || 0} карточек
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
            </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {deck.name}
        </h3>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
            {deck.description || "Краткое описание отсутствует, но эта колода точно поможет вам в обучении!"}
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                {deck.author_name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-bold text-slate-400 truncate max-w-[100px]">
                {deck.author_name || "Автор"}
            </span>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {deck.plays_count || 0} сессий
            </div>
        </div>
      </div>
    </motion.div>
  );
}

// Заглушка-скелетон для плавной загрузки
function SkeletonCard() {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
        <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="h-8 w-3/4 bg-slate-100 rounded-lg mb-3"></div>
      <div className="h-4 w-full bg-slate-100 rounded-lg mb-2"></div>
      <div className="h-4 w-2/3 bg-slate-100 rounded-lg mb-8"></div>
      <div className="flex justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100"></div>
          <div className="h-3 w-16 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-3 w-12 bg-slate-100 rounded-md"></div>
      </div>
    </div>
  );
}