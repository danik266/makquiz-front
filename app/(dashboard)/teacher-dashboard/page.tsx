"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, Loader2, Users, Play, Clock, Award,
  Brain, Sparkles, MonitorPlay
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function TeacherDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [decks, setDecks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]); // История сессий
  const [loading, setLoading] = useState(true);
  
  // Для модалки старта сессии
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedDeckForSession, setSelectedDeckForSession] = useState<any>(null);
  const [maxParticipants, setMaxParticipants] = useState(30);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    if (!token) { router.push("/auth"); return; }
    if (user?.role !== "teacher") { router.push("/dashboard"); return; }
    loadData();
  }, [token, user, router]);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const decksRes = await fetch("https://makquiz-back.onrender.com/api/decks/my?limit=50", { headers });
      if (decksRes.ok) setDecks(await decksRes.json());
      
      // Загружаем историю сессий
      const historyRes = await fetch("https://makquiz-back.onrender.com/api/live/history", { headers });
      if (historyRes.ok) setSessions(await historyRes.json());
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedDeckForSession) return;
    setStartingSession(true);
    
    try {
      const res = await fetch("https://makquiz-back.onrender.com/api/live/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          deck_id: selectedDeckForSession.id,
          max_participants: maxParticipants
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Перенаправляем учителя в "Комнату управления" (Хост)
        router.push(`/live/host/${data.session_id}`);
      }
    } catch (e) {
      console.error("Failed to start session", e);
    } finally {
      setStartingSession(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Панель учителя 👨‍🏫</h1>
          <p className="text-slate-500 font-medium mt-1">Управляйте материалами и проводите живые сессии</p>
        </div>
        <button onClick={() => router.push("/create")} className="bg-white border-2 border-orange-100 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition flex items-center gap-2">
          <Plus className="w-5 h-5" /> Создать материал
        </button>
      </header>

      {/* Секция материалов */}
      <div className="mb-12">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" /> Библиотека материалов
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <motion.div key={deck.id} whileHover={{ y: -4 }} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex w-fit items-center gap-1 mb-2", deck.content_type === "quiz" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700")}>
                      {deck.content_type === "quiz" ? <Sparkles className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                      {deck.content_type === "quiz" ? "Квиз" : "Колода"}
                   </span>
                   <h3 className="text-lg font-black text-slate-900 line-clamp-2">{deck.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500 mb-6 font-medium">
                 <span>{deck.total_cards} карточек</span>
              </div>
              <button 
                onClick={() => { setSelectedDeckForSession(deck); setShowStartModal(true); }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <MonitorPlay className="w-5 h-5" /> Запустить сессию
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* История сессий (Вместо списка студентов) */}
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" /> История проведенных сессий
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Дата</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Материал</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Участников</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-sm font-bold text-slate-700">
                    {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="py-4 px-6 font-medium text-orange-600">{s.deck_name}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{s.participants}</td>
                  <td className="py-4 px-6">
                    <span className={clsx("px-2 py-1 rounded-md text-xs font-bold uppercase", s.status === "completed" ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700 animate-pulse")}>
                      {s.status === "completed" ? "Завершено" : "Идет"}
                    </span>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 font-medium">История пуста</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модалка старта сессии */}
      <AnimatePresence>
        {showStartModal && selectedDeckForSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Настройка сессии</h3>
              <p className="text-slate-500 mb-6">{selectedDeckForSession.name}</p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Лимит участников</label>
                <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} className="w-full border-2 border-slate-200 rounded-xl text-slate-700 px-4 py-3 font-bold" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowStartModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">Отмена</button>
                <button onClick={handleStartSession} disabled={startingSession} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  {startingSession ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />} Начать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}