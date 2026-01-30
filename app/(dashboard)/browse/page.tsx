"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, Search, TrendingUp, Clock, 
  Eye, PlayCircle, User, Lock, Globe, Loader2,
  Brain, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

type SortBy = "created_at" | "plays_count" | "views_count";

export default function BrowsePage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
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
        `http://127.0.0.1:8000/api/decks/public?skip=${skip}&limit=${limit}&sort_by=${sortBy}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      setDecks(data.decks || []);
      setTotal(data.total || 0);
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
        `http://127.0.0.1:8000/api/decks/search?q=${encodeURIComponent(searchQuery)}`,
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
                  Каталог
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {total} публичных материалов
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, автору или теме..."
                className="w-full h-12 pl-12 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                Найти
              </button>
            </form>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="created_at">Недавние</option>
              <option value="plays_count">Популярные</option>
              <option value="views_count">Просматриваемые</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ничего не найдено</h3>
            <p className="text-slate-500 font-medium">
              Попробуйте изменить запрос или фильтры
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
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer"
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
                          {deck.total_cards || 0} {isQuiz ? "вопр." : "карт."}
                        </span>
                      </div>
                      
                      {/* Type badges */}
                      <div className="flex gap-1">
                        {isSpaced && (
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3 inline" />
                          </span>
                        )}
                        <span className={clsx(
                          "text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1",
                          isQuiz ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {isQuiz ? <Sparkles className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                          {isQuiz ? "Квиз" : "Колода"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2">
                      {deck.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
                      {deck.description || "Без описания"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        {deck.author_name || "Аноним"}
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