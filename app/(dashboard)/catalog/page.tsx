"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  ArrowLeft, Search, TrendingUp, Clock, 
  Eye, PlayCircle, User, Lock, Globe, Loader2,
  Brain, Sparkles, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

type SortBy = "created_at" | "plays_count" | "views_count";

export default function BrowsePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useLanguage();
  
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadDecks();
  }, [sortBy, skip]);

  const loadDecks = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://makquiz-back.onrender.com/api/decks/public?skip=${skip}&limit=${limit}&sort_by=${sortBy}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      
      // Исправление: проверяем формат ответа
      if (Array.isArray(data)) {
        setDecks(data);
        setTotal(data.length);
      } else {
        setDecks(data.decks || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadDecks();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://makquiz-back.onrender.com/api/decks/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      setDecks(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Переход на страницу превью колоды
  const handleDeckClick = (deckId: string) => {
    router.push(`/deck/${deckId}`);
  };

  const sortOptions = [
    { value: "created_at" as SortBy, label: t.browse.newest },
    { value: "plays_count" as SortBy, label: t.browse.popular },
    { value: "views_count" as SortBy, label: t.browse.mostViewed },
  ];

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || t.browse.newest;

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {t.browse.title}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {t.browse.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 overflow-hidden">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.browse.searchPlaceholder}
                    className="w-full h-12 pl-12 pr-4 border-none outline-none font-medium bg-transparent"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-bold hover:from-amber-500 hover:via-orange-600 hover:to-red-600 transition shadow-md shadow-orange-200"
                >
                  {t.browse.searchPlaceholder.split('...')[0]}
                </button>
              </div>
            </form>

            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none bg-white flex items-center justify-between w-full min-w-[160px] hover:bg-slate-50 transition"
              >
                <span>{currentSortLabel}</span>
                <ChevronDown className="w-5 h-5 text-slate-400 ml-2" />
              </button>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left font-bold text-slate-700 hover:bg-slate-50 transition",
                        option.value === sortBy && "bg-slate-100"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t.browse.noResults}</h3>
            <p className="text-slate-500 font-medium">
              {t.browse.tryAnother}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => {
                const deckId = deck._id || deck.id;
                const isQuiz = deck.content_type === "quiz";
                const isSpaced = deck.learning_mode === "spaced";
                
                return (
                  <motion.div
                    key={deckId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleDeckClick(deckId)}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {deck.is_public ? (
                          <Globe className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {deck.total_cards || 0} {isQuiz ? t.browse.questionsShort : t.browse.cardsShort}
                        </span>
                      </div>
                      
                      {/* Type badges */}
                      <div className="flex gap-1">
                        {isSpaced && (
                          <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3 inline" />
                          </span>
                        )}
                        <span className={clsx(
                          "text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1",
                          isQuiz ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {isQuiz ? <Sparkles className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                          {isQuiz ? t.browse.quiz : t.browse.deck}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2">
                      {deck.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
                      {deck.description || t.browse.noDescription}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        {deck.author_name || t.browse.anonymous}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5" />
                          {deck.plays_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {deck.views_count || 0}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Назад
                </button>
                <span className="px-4 py-2 font-bold text-slate-600">
                  {Math.floor(skip / limit) + 1} / {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setSkip(skip + limit)}
                  disabled={skip + limit >= total}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}