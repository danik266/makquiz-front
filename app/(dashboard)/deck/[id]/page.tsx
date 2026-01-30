"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, PlayCircle, Copy, User, Eye, Clock, 
  Loader2, Globe, Lock, Brain, Sparkles, Check, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface DeckPreview {
  id: string;
  name: string;
  description: string;
  author_name: string;
  content_type: string;
  learning_mode: string;
  total_cards: number;
  plays_count: number;
  views_count: number;
  is_public: boolean;
  is_author: boolean;
  created_at: string;
}

interface CardPreview {
  _id: string;
  front?: string;
  back?: string;
  question?: string;
  options?: string[];
}

export default function DeckPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const deckId = params?.id;

  const [deck, setDeck] = useState<DeckPreview | null>(null);
  const [cards, setCards] = useState<CardPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (deckId) {
      loadDeckPreview();
    }
  }, [deckId, token]);

  const loadDeckPreview = async () => {
    try {
      // Загружаем информацию о колоде
      const deckRes = await fetch(`http://127.0.0.1:8000/api/decks/${deckId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!deckRes.ok) {
        throw new Error("Колода не найдена");
      }
      
      const deckData = await deckRes.json();
      setDeck(deckData);

      // Загружаем превью карточек (первые 5)
      const cardsRes = await fetch(`http://127.0.0.1:8000/api/decks/${deckId}/preview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData.cards || []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToMyDecks = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setCopying(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/decks/${deckId}/clone`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Не удалось скопировать");
      }

      const data = await res.json();
      setCopied(true);
      
      // Через 2 секунды перенаправляем на изучение
      setTimeout(() => {
        router.push(`/study/${data.new_deck_id}`);
      }, 1500);
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCopying(false);
    }
  };

  const handleStudy = () => {
    router.push(`/study/${deckId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Ошибка</h2>
          <p className="text-slate-500 mb-8">{error || "Колода не найдена"}</p>
          <button 
            onClick={() => router.push("/browse")} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const isQuiz = deck.content_type === "quiz";
  const isSpaced = deck.learning_mode === "spaced";

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Deck Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8"
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={clsx(
              "text-xs font-bold px-3 py-1.5 rounded-lg uppercase flex items-center gap-1",
              isQuiz ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            )}>
              {isQuiz ? <Sparkles className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              {isQuiz ? "Квиз" : "Карточки"}
            </span>
            
            {isSpaced && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Интервальное
              </span>
            )}
            
            <span className={clsx(
              "text-xs font-bold px-3 py-1.5 rounded-lg uppercase flex items-center gap-1",
              deck.is_public ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
            )}>
              {deck.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {deck.is_public ? "Публичная" : "Приватная"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            {deck.name}
          </h1>

          {/* Description */}
          {deck.description && (
            <p className="text-slate-500 text-lg mb-6">
              {deck.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 text-slate-500">
              <User className="w-4 h-4" />
              <span className="font-medium">{deck.author_name || "Аноним"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Brain className="w-4 h-4" />
              <span className="font-medium">{deck.total_cards} {isQuiz ? "вопросов" : "карточек"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <PlayCircle className="w-4 h-4" />
              <span className="font-medium">{deck.plays_count} прохождений</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{deck.views_count} просмотров</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {deck.is_author ? (
              // Если это твоя колода - сразу учить
              <button
                onClick={handleStudy}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                Начать изучение
              </button>
            ) : copied ? (
              // Уже скопировано
              <div className="flex-1 bg-green-100 text-green-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Добавлено! Переходим...
              </div>
            ) : (
              // Чужая колода - нужно сначала добавить к себе
              <button
                onClick={handleCopyToMyDecks}
                disabled={copying}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:bg-indigo-400"
              >
                {copying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copying ? "Копируем..." : "Добавить к себе"}
              </button>
            )}
          </div>

          {!deck.is_author && !copied && (
            <p className="text-center text-sm text-slate-400 mt-3">
              Колода будет скопирована в ваши материалы
            </p>
          )}
        </motion.div>

        {/* Preview Cards */}
        {cards.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              Превью {isQuiz ? "вопросов" : "карточек"}
            </h2>
            
            <div className="space-y-3">
              {cards.map((card, idx) => (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-slate-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-500">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      {isQuiz ? (
                        <>
                          <p className="font-bold text-slate-900 mb-2">{card.question}</p>
                          {card.options && (
                            <div className="flex flex-wrap gap-2">
                              {card.options.slice(0, 3).map((opt, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                  {opt.length > 30 ? opt.slice(0, 30) + "..." : opt}
                                </span>
                              ))}
                              {card.options.length > 3 && (
                                <span className="text-xs text-slate-400">+{card.options.length - 3}</span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900">{card.front}</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {card.back && card.back.length > 100 
                              ? card.back.slice(0, 100) + "..." 
                              : card.back
                            }
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {deck.total_cards > cards.length && (
              <p className="text-center text-sm text-slate-400 mt-4">
                И ещё {deck.total_cards - cards.length} {isQuiz ? "вопросов" : "карточек"}...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}