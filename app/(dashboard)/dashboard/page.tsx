"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Plus, Loader2, TrendingUp, CheckCircle2,
  Trophy, Sparkles, Brain, Clock, Users, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

type DeckType = {
  id: string;
  name: string;
  description: string;
  total_cards: number;
  learned_cards: number;
  cards_due: number;
  progress: number;
  is_mastered: boolean;
  content_type: string; // "flashcards" | "quiz"
  learning_mode: string; // "all_at_once" | "spaced"
  is_assigned: boolean;
  teacher_name?: string;
  status_backend: string;
};

function pluralizeCards(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} карт`;
  if (lastDigit === 1) return `${count} карта`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} карты`;
  return `${count} карт`;
}

export default function Dashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Защита: если пользователь teacher, перенаправляем на teacher-dashboard
    if (user?.role === "teacher") {
      router.push("/teacher-dashboard");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const myDecksRes = await fetch("https://makquiz-back.onrender.com/api/decks/my?limit=50", { headers });
        const myDecksRaw = myDecksRes.ok ? await myDecksRes.json() : [];

        const teacherDecksRes = await fetch("https://makquiz-back.onrender.com/api/teacher/my-teachers-decks", { headers });
        const teacherDecksRaw = teacherDecksRes.ok ? await teacherDecksRes.json() : [];

        const normalizeDeck = (d: any, isTeacher: boolean): DeckType => {
            const id = isTeacher ? d.deck_id : d.id;
            const name = isTeacher ? d.deck_name : d.name;
            const description = d.description || d.deck_description || "";
            const total = d.total_cards || 0;
            const learned = d.cards_studied !== undefined ? d.cards_studied : (d.learned_cards || 0);
            const due = d.cards_due || 0;
            let progress = 0;
            if (total > 0) {
                progress = Math.round((learned / total) * 100);
            }
            const isMastered = progress >= 100;

            return {
                id: String(id),
                name: name,
                description: description,
                total_cards: total,
                learned_cards: learned,
                cards_due: due,
                progress: progress,
                is_mastered: isMastered,
                content_type: d.content_type || "flashcards",
                learning_mode: d.learning_mode || "all_at_once",
                is_assigned: isTeacher,
                teacher_name: d.teacher_name,
                status_backend: d.status || "active"
            };
        };

        const allDecks = [
            ...myDecksRaw.map((d: any) => normalizeDeck(d, false)),
            ...teacherDecksRaw.map((d: any) => normalizeDeck(d, true))
        ];

        setDecks(allDecks);

        const statsRes = await fetch("https://makquiz-back.onrender.com/api/decks/stats/today", { headers });
        if (statsRes.ok) setStats(await statsRes.json());

      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
      </div>
    );
  }

  // === НОВАЯ ЛОГИКА РАЗДЕЛЕНИЯ ===

  // 1. ИНТЕРВАЛЬНЫЕ КОЛОДЫ (spaced) - отдельный блок сверху
  const spacedDecks = decks.filter(d => d.learning_mode === "spaced");
  
  // Активные интервальные (есть карты к повторению сегодня)
  const activeSpaced = spacedDecks.filter(d => 
    d.status_backend === "active" && d.cards_due > 0
  );
  
  // Интервальные на паузе (прошли сегодня, ждем завтра)
  const waitingSpaced = spacedDecks.filter(d => 
    d.status_backend === "done_for_today" || 
    (d.status_backend === "active" && d.cards_due === 0 && d.learned_cards > 0)
  );

  // 2. ОБЫЧНЫЕ МАТЕРИАЛЫ (all_at_once) - колоды и тесты вместе
  // Показываем только: начатые (progress > 0) или пустые новые для начала
  const regularMaterials = decks.filter(d => d.learning_mode === "all_at_once");
  
  // Доступные для прохождения (не начаты или в процессе)
  const availableMaterials = regularMaterials.filter(d => d.progress < 100);
  
  // Пройденные полностью
  const completedMaterials = regularMaterials.filter(d => d.progress >= 100);

  // Счетчик задач на сегодня (только интервальные!)
  const todayTasksCount = activeSpaced.length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Привет, {user?.username}! 👋</h1>
          <p className="text-slate-500 font-medium mt-1">
            {todayTasksCount > 0
              ? `Интервальное повторение: ${todayTasksCount} колод к изучению`
              : "Все интервальные повторения на сегодня выполнены!"}
          </p>
        </div>

        <div
          onClick={() => router.push("/history")}
          className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-orange-200 shadow-sm shadow-orange-100 cursor-pointer hover:border-orange-300 hover:shadow-md hover:shadow-orange-200 transition-all group"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Изучено сегодня</span>
            <span className="text-lg font-black text-orange-600 group-hover:scale-105 transition-transform">
              {(stats?.new_cards_learned || 0) + (stats?.cards_reviewed || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-bold text-orange-600 border-2 border-white shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* ПУСТОЙ ЭКРАН */}
      {decks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Добро пожаловать!</h3>
          <p className="text-slate-600 mb-6">У вас пока нет курсов. Создайте свою колоду или присоединитесь к колоде учителя по коду.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/create")}
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
            >
              Создать колоду
            </button>
            <button
              onClick={() => router.push("/join")}
              className="bg-white border-2 border-orange-200 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 hover:border-orange-300 transition-all"
            >
              Присоединиться по коду
            </button>
          </div>
        </div>
      )}

      {/* === БЛОК 1: ИНТЕРВАЛЬНОЕ ОБУЧЕНИЕ === */}
      {spacedDecks.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Интервальное обучение
            </h2>
            <span className="text-sm text-slate-400 font-medium">
              {activeSpaced.length > 0 ? `${activeSpaced.length} к повторению` : "Всё на сегодня!"}
            </span>
          </div>

          {/* Активные к повторению */}
          {activeSpaced.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {activeSpaced.map((deck) => (
                <SpacedDeckCard key={deck.id} deck={deck} router={router} isActive={true} />
              ))}
            </div>
          )}

          {/* Сообщение "всё сделано" + ожидающие */}
          {activeSpaced.length === 0 && waitingSpaced.length > 0 && (
            <div className="mb-4 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-green-900">Отлично! На сегодня всё!</h3>
                <p className="text-sm text-green-700">Следующие повторения будут доступны завтра.</p>
              </div>
            </div>
          )}

          {/* Ожидающие завтра */}
          {waitingSpaced.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {waitingSpaced.map((deck) => (
                <SpacedDeckCard key={deck.id} deck={deck} router={router} isActive={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* === БЛОК 2: ВАШИ МАТЕРИАЛЫ (обычные колоды + тесты) === */}
      {regularMaterials.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Ваши материалы
            </h2>
          </div>

          {/* Доступные / В процессе */}
          {availableMaterials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {availableMaterials.map((deck) => (
                <MaterialCard key={deck.id} deck={deck} router={router} />
              ))}
            </div>
          )}

          {/* Пройденные */}
          {completedMaterials.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Пройденные
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {completedMaterials.map((deck) => (
                  <CompletedMaterialCard key={deck.id} deck={deck} router={router} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// === КОМПОНЕНТ: Интервальная колода ===
function SpacedDeckCard({ deck, router, isActive }: { deck: DeckType, router: any, isActive: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => router.push(`/study/${deck.id}`)}
      className={clsx(
        "bg-white border p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden",
        isActive
          ? "border-orange-200 hover:border-orange-400 hover:shadow-orange-100"
          : "border-slate-200 opacity-80"
      )}
    >
      {/* Индикатор активности */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Интервал
          </span>
          {deck.is_assigned && (
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
              <Users className="w-3 h-3" /> Учитель
            </span>
          )}
        </div>
        {isActive && deck.cards_due > 0 && (
          <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-md">
            {pluralizeCards(deck.cards_due)}
          </span>
        )}
      </div>

      <h3 className={clsx("font-bold text-slate-900 mb-1 line-clamp-2", isActive ? "text-lg" : "text-base")}>
        {deck.name}
      </h3>

      {isActive && deck.description && (
        <p className="text-xs text-slate-500 line-clamp-1 mb-3">{deck.description}</p>
      )}

      <div className="mt-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className={isActive ? "text-slate-500" : "text-green-600"}>
            {isActive ? "Прогресс" : "Ждем завтра"}
          </span>
          <span className="text-slate-500">{deck.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all",
              isActive ? "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" : "bg-green-500"
            )}
            style={{ width: `${deck.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1 text-right">
          {deck.learned_cards} из {deck.total_cards} выучено
        </p>
      </div>
    </motion.div>
  );
}

// === КОМПОНЕНТ: Обычный материал (колода или тест) ===
function MaterialCard({ deck, router }: { deck: DeckType, router: any }) {
  const isQuiz = deck.content_type === "quiz";
  const isStarted = deck.progress > 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => router.push(`/study/${deck.id}`)}
      className="bg-white border-2 border-slate-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 p-5 rounded-2xl shadow-sm transition-all cursor-pointer relative overflow-hidden min-h-[180px] flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className={clsx(
              "text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1",
              isQuiz ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700"
            )}>
              {isQuiz ? <Sparkles className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
              {isQuiz ? "Тест" : "Колода"}
            </span>
            {deck.is_assigned && (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
                <Users className="w-3 h-3" /> Учитель
              </span>
            )}
          </div>
          {isStarted && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
              В процессе
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2">{deck.name}</h3>
        {deck.description && (
          <p className="text-xs text-slate-500 line-clamp-1">{deck.description}</p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
          <span>Прогресс</span>
          <span>{deck.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all",
              isQuiz ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
            )}
            style={{ width: `${deck.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1 text-right">
          {deck.learned_cards} из {deck.total_cards} {isQuiz ? "отвечено" : "выучено"}
        </p>
      </div>
    </motion.div>
  );
}

// === КОМПОНЕНТ: Пройденный материал ===
function CompletedMaterialCard({ deck, router }: { deck: DeckType, router: any }) {
  const isQuiz = deck.content_type === "quiz";

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={() => router.push(`/study/${deck.id}`)}
      className="bg-white border border-slate-200 hover:border-orange-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isQuiz ? "bg-gradient-to-br from-purple-100 to-pink-100" : "bg-gradient-to-br from-amber-100 to-orange-100"
        )}>
          {isQuiz ? (
            <Sparkles className="w-4 h-4 text-purple-500" />
          ) : (
            <Brain className="w-4 h-4 text-orange-500" />
          )}
        </div>
        <Trophy className="w-4 h-4 text-amber-500" />
      </div>

      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2">{deck.name}</h3>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-green-600 uppercase">Пройдено</span>
        <span className="text-xs font-bold text-slate-500">{deck.total_cards} {isQuiz ? "вопр." : "карт"}</span>
      </div>
    </motion.div>
  );
}