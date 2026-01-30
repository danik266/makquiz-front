"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, RotateCcw, Check, X, Eye, Brain,
  Target, Award, BarChart3, BookOpen, Loader2, AlertCircle, Trophy, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Card {
  _id: string;
  front: string;
  back: string;
  image_url?: string;
}

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correct_answers: number[];
  explanation?: string;
  image_url?: string;
}

type ContentItem = Card | QuizQuestion;

function isQuizQuestion(item: ContentItem): item is QuizQuestion {
  return (
    'question' in item && 
    'options' in item && 
    Array.isArray((item as any).options) && 
    (item as any).options.length > 0
  );
}

interface StudySession {
  total: number;
  current: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

interface DeckStats {
  total_cards: number;
  learned_cards: number;
  cards_due: number;
  status: "active" | "done_for_today" | "mastered" | "empty";
  content_type: string;      // "flashcards" | "quiz"
  learning_mode: string;     // "spaced" | "all_at_once"  <-- ДОБАВЛЕНО
}

export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const deckId = params?.id;

  const [cards, setCards] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [isQuizAnswerCorrect, setIsQuizAnswerCorrect] = useState(false);
  
  const [session, setSession] = useState<StudySession>({
    total: 0,
    current: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0
  });
  
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const failedCardsIds = useRef<Set<string>>(new Set());

  // === ВСПОМОГАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ ===
  const isSpaced = deckStats?.learning_mode === "spaced";
  const isQuiz = deckStats?.content_type === "quiz";

  useEffect(() => {
    if (token && deckId && deckId !== "undefined") {
      fetchDeckInfo();
    } else if (deckId === "undefined") {
      console.error("Попытка загрузить deckId = undefined");
      router.push("/dashboard");
    }
  }, [deckId, token]);

  const fetchDeckInfo = async () => {
    if (!deckId) return;
    
    setError(null); // Сброс ошибки перед загрузкой
    
    try {
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/${deckId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("Не удалось загрузить информацию о колоде");
      
      const data = await res.json();
      setDeckStats({
        total_cards: data.total_cards,
        learned_cards: data.learned_cards,
        cards_due: data.cards_due || 0,
        status: data.status || "active",
        content_type: data.content_type || "flashcards",
        learning_mode: data.learning_mode || "all_at_once"  // <-- ВАЖНО
      });
      
      // Логика загрузки карточек (бывшая fetchCards)
      const cardsRes = await fetch(`https://makquiz-back.onrender.com/api/decks/${deckId}/study-session`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!cardsRes.ok) {
        throw new Error(`HTTP ${cardsRes.status}: ${cardsRes.statusText}`);
      }
      
      const cardsData = await cardsRes.json();
      const combinedCards = [...(cardsData.new_cards || []), ...(cardsData.review_cards || [])];
      
      setCards(combinedCards);
      
      if (combinedCards.length === 0 && data.total_cards > 0) {
        setShowResults(true);
      }
      
      setSession({
        total: combinedCards.length,
        current: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0
      });
      sessionStartTimeRef.current = Date.now();
      startTimeRef.current = Date.now();

    } catch (error: any) {
      console.error("Fetch deck info error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Сброс прогресса - ТОЛЬКО для обычных колод/тестов
  const resetProgress = async () => {
    if (!confirm("Вы уверены? Весь прогресс изучения будет сброшен.")) return;
    
    try {
      setLoading(true);
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/${deckId}/reset`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to reset progress");
      }
      
      failedCardsIds.current.clear();
      setSession({ total: 0, current: 0, correct: 0, incorrect: 0, skipped: 0 });
      setShowResults(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      
      await fetchDeckInfo();
      
    } catch (e) {
      console.error(e);
      alert("Не удалось сбросить прогресс");
      setLoading(false);
    }
  };

  const sendAnswer = async (cardId: string, quality: number) => {
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    try {
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/cards/${cardId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          quality: quality,
          time_taken: timeTaken
        })
      });
      
      if (!res.ok) {
        console.error("Failed to save answer:", res.status);
      }
    } catch (e) {
      console.error("Failed to sync answer", e);
    }
  };

  const finishSession = async (finalSession: StudySession) => {
    const totalDuration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    
    try {
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/${deckId}/complete-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          correct: finalSession.correct,
          incorrect: finalSession.incorrect,
          skipped: finalSession.skipped,
          duration_seconds: totalDuration
        })
      });
      
      if (!res.ok) {
        console.error("Failed to save session:", res.status);
      }
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const handleNextCard = (totalCards: number = cards.length) => {
    const nextIdx = currentIndex + 1;
    
    if (nextIdx < totalCards) {
      setTimeout(() => {
        setCurrentIndex(nextIdx);
        setIsFlipped(false);
        setSelectedOptions([]);
        setShowQuizFeedback(false);
        setIsQuizAnswerCorrect(false);
        startTimeRef.current = Date.now();
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 300);
    }
  };

  const handleQuizAnswer = () => {
    const currentCard = cards[currentIndex];
    if (!currentCard || !isQuizQuestion(currentCard)) return;

    const sortedSelected = [...selectedOptions].sort();
    const sortedCorrect = [...currentCard.correct_answers].sort();
    const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

    setIsQuizAnswerCorrect(isCorrect);
    setShowQuizFeedback(true);

    const isFirstAttempt = !failedCardsIds.current.has(currentCard._id);

    if (!isCorrect) {
      failedCardsIds.current.add(currentCard._id);
    }

    const newSessionState = {
      ...session,
      current: session.current + 1,
      correct: (isCorrect && isFirstAttempt) ? session.correct + 1 : session.correct,
      incorrect: !isCorrect ? session.incorrect + 1 : session.incorrect,
    };

    setSession(newSessionState);
    sendAnswer(currentCard._id, isCorrect ? 5 : 1);
  };

  const handleQuizNext = () => {
    const totalCardsNow = cards.length;

    setSelectedOptions([]);
    setShowQuizFeedback(false);
    setIsQuizAnswerCorrect(false);

    if (currentIndex < totalCardsNow - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        startTimeRef.current = Date.now();
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
        finishSession(session);
      }, 300);
    }
  };

  const handleAnswer = (quality: number) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return; // FIX: Проверка на undefined

    const isCorrect = quality >= 3;
    const isFirstAttempt = !failedCardsIds.current.has(currentCard._id);

    sendAnswer(currentCard._id, quality);

    let updatedCards = [...cards];
    if (!isCorrect) {
      updatedCards.push(currentCard);
      failedCardsIds.current.add(currentCard._id);
    }

    const newSessionState = {
      ...session,
      current: session.current + 1,
      correct: (isCorrect && isFirstAttempt) ? session.correct + 1 : session.correct,
      incorrect: !isCorrect ? session.incorrect + 1 : session.incorrect,
    };

    setCards(updatedCards);
    setSession(newSessionState);
    handleNextCard(updatedCards.length); 
  };

  const handleSkip = () => {
    const newSessionState = {
      ...session,
      current: session.current + 1,
      skipped: session.skipped + 1
    };
    setSession(newSessionState);
    handleNextCard(cards.length); 
  };

  const resetStudy = async () => {
    setShowResults(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    failedCardsIds.current.clear();
    
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`https://makquiz-back.onrender.com/api/decks/${deckId}/study-session`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      const combinedCards = [...(data.new_cards || []), ...(data.review_cards || [])];
      
      setCards(combinedCards);
      
      if (combinedCards.length === 0 && deckStats && deckStats.total_cards > 0) {
        setShowResults(true);
      }
      
      setSession({
        total: combinedCards.length,
        current: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0
      });
      sessionStartTimeRef.current = Date.now();
      startTimeRef.current = Date.now();
      
    } catch (error: any) {
      console.error("Reset study error:", error);
      setError(error.message || "Не удалось загрузить карточки");
    } finally {
      setLoading(false);
    }
  };

  // === LOADING ===
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {isQuiz ? "Подбираем вопросы..." : "Подбираем карточки..."}
          </p>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Ошибка загрузки</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => { setLoading(true); setError(null); fetchDeckInfo(); }}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Повторить
            </button>
            <button 
              onClick={() => router.push("/dashboard")} 
              className="flex-1 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === КОЛОДА ПУСТА ИЗНАЧАЛЬНО ===
  if (!loading && cards.length === 0 && !showResults && deckStats?.total_cards === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isQuiz ? "Квиз пуст" : "Колода пуста"}
          </h2>
          <p className="text-slate-500 mb-8">
            {isQuiz
              ? "В этом квизе нет вопросов. Добавьте вопросы, чтобы начать!"
              : "В этой колоде нет карточек. Добавьте карточки, чтобы начать!"
            }
          </p>
          <button 
            onClick={() => router.push("/dashboard")} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-indigo-700 transition"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // === ВСЁ ПРОЙДЕНО (карточек нет, но колода не пустая) ===
  if (!loading && cards.length === 0 && showResults && deckStats && deckStats.total_cards > 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            {/* Разные иконки для разных режимов */}
            <div className={clsx(
              "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl",
              isSpaced 
                ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-200" 
                : "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-200"
            )}>
              {isSpaced ? (
                <Clock className="w-12 h-12 text-white" />
              ) : (
                <Trophy className="w-12 h-12 text-white" />
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              {isSpaced 
                ? "На сегодня всё! ✨" 
                : (isQuiz ? "Квиз пройден! 🎉" : "Колода пройдена! 🎉")
              }
            </h1>

            <p className="text-xl text-slate-600 mb-2">
              {isSpaced ? (
                <>Вы повторили все карточки на сегодня</>
              ) : (
                <>
                  Вы {isQuiz ? "ответили на" : "выучили"} все{" "}
                  <span className="font-black text-green-600">{deckStats.total_cards}</span>{" "}
                  {isQuiz ? "вопросов" : "карточек"}
                </>
              )}
            </p>

            <p className="text-slate-500">
              {isSpaced 
                ? "Следующие карточки будут доступны завтра по алгоритму интервального повторения."
                : (isQuiz 
                    ? "Вы можете пройти тест заново или вернуться к другим материалам." 
                    : "Вы можете пройти колоду заново или вернуться к другим материалам."
                  )
              }
            </p>
          </motion.div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">{deckStats.learned_cards}</p>
              <p className="text-sm text-slate-500 font-bold uppercase">Выучено</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-indigo-600 mb-1">{deckStats.total_cards}</p>
              <p className="text-sm text-slate-500 font-bold uppercase">
                {isQuiz ? "Всего вопросов" : "Всего карточек"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-purple-600 mb-1">
                {Math.round((deckStats.learned_cards / deckStats.total_cards) * 100)}%
              </p>
              <p className="text-sm text-slate-500 font-bold uppercase">Прогресс</p>
            </motion.div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Вернуться в дашборд
            </motion.button>
          </div>

          {/* Кнопка сброса - ТОЛЬКО для обычных колод/тестов, НЕ для интервальных */}
          {!isSpaced && (
            <div className="mt-6 text-center">
              <button 
                onClick={resetProgress}
                className="text-slate-400 text-sm font-bold hover:text-red-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить прогресс и пройти заново
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === ЭКРАН РЕЗУЛЬТАТОВ СЕССИИ ===
  if (showResults && session.total > 0) {
    const uniqueTotal = cards.length - failedCardsIds.current.size;
    const accuracy = uniqueTotal > 0 
      ? Math.round((session.correct / uniqueTotal) * 100) 
      : 0;
    
    const effort = uniqueTotal > 0 
      ? (session.current / uniqueTotal).toFixed(1) 
      : "0.0";

    let performance = "";
    let performanceColor = "";
    
    if (accuracy >= 90) {
      performance = "Превосходно! 🔥";
      performanceColor = "text-green-600";
    } else if (accuracy >= 70) {
      performance = "Хорошая работа! 💪";
      performanceColor = "text-indigo-600";
    } else if (accuracy >= 50) {
      performance = "Неплохо, продолжай! 👍";
      performanceColor = "text-orange-600";
    } else {
      performance = "Повторим еще раз? 📚";
      performanceColor = "text-slate-600";
    }

    return (
      <div className="min-h-screen bg-[#F8F9FC] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Сессия завершена!
            </h1>
            <p className={clsx("text-2xl font-bold mb-6", performanceColor)}>
              {performance}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={Check}
              color="green"
              value={session.correct}
              label={isQuiz ? "Правильно" : "С первого раза"}
              delay={0}
            />
            <StatsCard
              icon={RotateCcw}
              color="orange"
              value={failedCardsIds.current.size}
              label={isQuiz ? "Ошибок" : "Повторено"}
              delay={0.1}
            />
            <StatsCard
              icon={Brain}
              color="indigo"
              value={`${accuracy}%`}
              label="Точность"
              delay={0.2}
            />
            <StatsCard
              icon={BarChart3}
              color="purple"
              value={effort}
              label="Среднее усилие"
              delay={0.3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Кнопка "Учить ещё" - только для обычных колод */}
            {!isSpaced && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetStudy}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                {isQuiz ? "Пройти заново" : "Учить еще"}
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className={clsx(
                "flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all",
                isSpaced 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                  : "bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200"
              )}
            >
              <BookOpen className="w-5 h-5" />
              В дашборд
            </motion.button>
          </div>
          
          {/* Кнопка сброса - ТОЛЬКО для обычных колод/тестов */}
          {!isSpaced && deckStats && deckStats.learned_cards === deckStats.total_cards && (
            <div className="mt-6 text-center">
              <button 
                onClick={resetProgress}
                className="text-slate-400 text-sm font-bold hover:text-red-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить весь прогресс и начать заново
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FIX: Добавил проверку перед рендером основного экрана
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Подождите, сессия завершается...</p>
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ ЭКРАН ИЗУЧЕНИЯ ===
  const currentCard = cards[currentIndex];
  if (!currentCard) return null; // FIX: Дополнительная проверка

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8F9FC] relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Выход</span>
            </button>
            <div className="flex items-center gap-4 text-sm font-bold">
              {/* Бейдж типа */}
              <span className={clsx(
                "hidden sm:inline-block px-2 py-0.5 rounded text-xs uppercase tracking-wide",
                isQuiz ? "bg-purple-100 text-purple-700" : 
                isSpaced ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {isQuiz ? "Квиз" : isSpaced ? "Интервал" : "Колода"}
              </span>
              <div className="flex items-center gap-1.5 text-green-600">
                <Check className="w-4 h-4" /> {session.correct}
              </div>
              <div className="flex items-center gap-1.5 text-red-600">
                <X className="w-4 h-4" /> {session.incorrect}
              </div>
              <div className="text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {currentIndex + 1} / {cards.length}
              </div>
            </div>
          </div>
          
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className={clsx(
                "h-full",
                isQuiz ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                isSpaced ? "bg-gradient-to-r from-indigo-500 to-purple-600" :
                "bg-gradient-to-r from-emerald-500 to-green-500"
              )}
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {/* Quiz Mode UI */}
            {isQuiz && currentCard && isQuizQuestion(currentCard) ? (
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl min-h-[450px] flex flex-col">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 mx-auto">
                  <Target className="w-7 h-7" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-8">
                  {currentCard.question || "Загрузка..."} {/* FIX: Проверка на пустое поле */}
                </h2>

                {currentCard.image_url && (
                  <img
                    src={currentCard.image_url}
                    alt="Question visual"
                    className="w-full max-h-40 object-cover rounded-xl mb-6"
                  />
                )}

                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {currentCard.options.map((option, idx) => {
                    const isSelected = selectedOptions.includes(idx);
                    const isCorrect = currentCard.correct_answers.includes(idx);
                    const showFeedback = showQuizFeedback;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!showFeedback) {
                            if (selectedOptions.includes(idx)) {
                              setSelectedOptions(selectedOptions.filter(i => i !== idx));
                            } else {
                              setSelectedOptions([...selectedOptions, idx]);
                            }
                          }
                        }}
                        disabled={showFeedback}
                        className={clsx(
                          "w-full p-4 rounded-xl text-slate-900 border-2 text-left font-semibold transition-all",
                          !showFeedback && isSelected && "bg-purple-50 border-purple-500",
                          !showFeedback && !isSelected && "bg-white border-slate-200 hover:border-purple-300",
                          showFeedback && isCorrect && "bg-green-100 border-green-500",
                          showFeedback && !isCorrect && isSelected && "bg-red-100 border-red-500",
                          showFeedback && !isCorrect && !isSelected && "bg-slate-50 border-slate-200",
                          showFeedback && "cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            !showFeedback && isSelected && "bg-purple-500 border-purple-500",
                            !showFeedback && !isSelected && "border-slate-300",
                            showFeedback && isCorrect && "bg-green-500 border-green-500",
                            showFeedback && !isCorrect && isSelected && "bg-red-500 border-red-500"
                          )}>
                            {((showFeedback && isCorrect) || (!showFeedback && isSelected)) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                            {showFeedback && !isCorrect && isSelected && (
                              <X className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-lg">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showQuizFeedback && currentCard.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      "mt-6 p-4 rounded-xl",
                      isQuizAnswerCorrect ? "bg-green-50 border-2 border-green-200" : "bg-orange-50 border-2 border-orange-200"
                    )}
                  >
                    <p className={clsx(
                      "text-sm font-semibold mb-2",
                      isQuizAnswerCorrect ? "text-green-800" : "text-orange-800"
                    )}>
                      {isQuizAnswerCorrect ? "Правильно!" : "Объяснение:"}
                    </p>
                    <p className="text-slate-700">{currentCard.explanation}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Flashcard Mode UI */
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative cursor-pointer group perspective-1000 w-full"
                style={{ minHeight: "450px" }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full h-full min-h-[450px]"
                >
                  <div
                    className={clsx(
                      "absolute inset-0 bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 backface-hidden",
                      "group-hover:border-indigo-200 transition-colors"
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className={clsx(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                      isSpaced ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Brain className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-8 overflow-y-auto max-h-[250px] scrollbar-hide">
                      {currentCard && (isQuizQuestion(currentCard) ? currentCard.question : (currentCard as Card).front) || "Загрузка..."} {/* FIX: Проверка на пустое поле */}
                    </h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-auto">
                      Нажмите, чтобы перевернуть
                    </p>
                  </div>

                  <div
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-xl backface-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)" 
                    }}
                  >
                    {currentCard?.image_url && (
                      <img
                        src={currentCard.image_url}
                        alt="Visual hint"
                        className="w-full max-h-40 object-cover rounded-xl mb-6 border-4 border-white/10"
                      />
                    )}
                    <p className="text-white text-xl md:text-2xl font-bold leading-relaxed overflow-y-auto max-h-[300px] scrollbar-hide">
                      {currentCard && (isQuizQuestion(currentCard) ? currentCard.explanation || "Правильно!" : (currentCard as Card).back) || "Загрузка..."} {/* FIX: Проверка на пустое поле */}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ANSWER BUTTONS */}
        <div className="w-full mt-8 h-24">
          {isQuiz && currentCard && isQuizQuestion(currentCard) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 h-full"
            >
              {!showQuizFeedback ? (
                <button
                  onClick={handleQuizAnswer}
                  disabled={selectedOptions.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Проверить
                </button>
              ) : (
                <button
                  onClick={handleQuizNext}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Далее
                </button>
              )}
            </motion.div>
          ) : !isFlipped ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-400 font-medium text-sm flex items-center justify-center h-full"
            >
              Подумайте над ответом, затем переверните карту
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 md:gap-4 h-full"
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleAnswer(1); }}
                className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-200 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95"
              >
                <X className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">Забыл</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleAnswer(2); }}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-2 border-orange-200 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95"
              >
                <Eye className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">Смутно</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleAnswer(5); }}
                className="bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-200 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95"
              >
                <Check className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">Знаю</span>
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatsCard({ icon: Icon, color, value, label, delay }: any) {
  const colors: any = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 text-center"
    >
      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={clsx("text-2xl font-black mb-0.5", colors[color].split(" ")[1])}>{value}</p>
      <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
    </motion.div>
  );
}