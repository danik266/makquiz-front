"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, MoreVertical, PlayCircle, BookOpen, 
  Loader2, Brain, Sparkles, Clock 
} from "lucide-react";
import clsx from "clsx";

export default function LibraryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    setLoading(true);
    
    fetch("https://makquiz-back.onrender.com/api/decks/my", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        setDecks(Array.isArray(data) ? data : []);
        setLoading(false);
    })
    .catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header - фиксированный на мобильных */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Моя библиотека
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {decks.length} {decks.length === 1 ? 'колода' : 'колод'}
              </p>
            </div>
            <button 
              onClick={() => router.push("/create")} 
              className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 active:scale-95 transition-transform shadow-lg shadow-orange-200"
            >
              <Plus className="w-5 h-5" /> 
              <span className="hidden sm:inline">Создать</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && decks.length === 0 && (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-300">
            <div className="bg-orange-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Здесь пока пусто</h3>
            <p className="text-slate-500 mt-2 mb-6 px-4">
              Создайте свою первую колоду, чтобы начать обучение
            </p>
            <button 
              onClick={() => router.push("/create")}
              className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition"
            >
              Создать колоду
            </button>
          </div>
        )}

        {/* Grid Content - адаптивная сетка */}
        {!loading && decks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {decks.map(deck => {
              const deckId = deck._id || deck.id;
              const isQuiz = deck.content_type === "quiz";
              const isSpaced = deck.learning_mode === "spaced";
              
              return (
                <div 
                  key={String(deckId)} 
                  className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => router.push(`/deck/${deckId}`)}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {isSpaced && (
                        <span className="bg-amber-50 text-amber-600 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="hidden sm:inline">Интервальное</span>
                        </span>
                      )}
                      <span className={clsx(
                        "text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1",
                        isQuiz 
                          ? "bg-purple-50 text-purple-600" 
                          : "bg-emerald-50 text-emerald-600"
                      )}>
                        {isQuiz ? <Sparkles className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                        {isQuiz ? "Квиз" : "Карточки"}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: открыть меню
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-slate-500" />
                    </button>
                  </div>
                  
                  {/* Card Content */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2 leading-tight mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    {deck.description || "Нет описания"}
                  </p>
                  
                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">
                      {deck.total_cards || 0} {isQuiz ? "вопросов" : "карточек"}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/study/${deckId}`);
                      }}
                      className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" /> 
                      <span>Учить</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}