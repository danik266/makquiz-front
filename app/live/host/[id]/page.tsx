"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QRCode from "react-qr-code";
import { 
  Loader2, Users, Play, StopCircle, Crown, Medal, 
  Trophy, Star, BookOpen, ArrowRight, Check, Zap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function HostPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState("loading");
  
  // Новое: храним вопросы для фазы разбора
  const [cards, setCards] = useState<any[]>([]); 

  // 1. Загружаем вопросы (карточки) один раз при старте
  useEffect(() => {
    if (!id) return;
    // Предполагаем, что этот эндпоинт публичный или доступен учителю
    fetch(`https://makquiz-backend.onrender.com/api/live/${id}/cards`)
        .then(res => res.json())
        .then(data => setCards(data))
        .catch(err => console.error("Ошибка загрузки карт:", err));
  }, [id]);

  // 2. Опрос статуса и участников (Long Polling)
  useEffect(() => {
    if (!id || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://makquiz-backend.onrender.com/api/live/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setParticipants(data.participants_list || []);
          setResults(data.results || []);
          
          if (!sessionData) setSessionData(data);
        }
      } catch (e) { console.error(e); }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, token, sessionData]);

  // --- ACTIONS ---

  const startGame = async () => {
    await fetch(`https://makquiz-backend.onrender.com/api/live/${id}/start`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
  };

  const startReview = async () => {
    await fetch(`https://makquiz-backend.onrender.com/api/live/${id}/review`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
  };

  const finishGame = async () => {
    await fetch(`https://makquiz-backend.onrender.com/api/live/${id}/finish`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
  };

  // Сортировка
  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const top3 = sortedResults.slice(0, 3);

  // --- RENDER: ЛОББИ ОЖИДАНИЯ ---
  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        {/* Фоновые элементы */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="max-w-6xl w-full bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-12 relative z-10">
          
          {/* Левая часть: QR и Код */}
          <div className="flex-1 flex flex-col items-center justify-center text-center border-r border-white/10 pr-12">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Присоединяйтесь!</h1>
            <p className="text-indigo-200 mb-8 font-medium text-lg">Сканируйте QR или введите код</p>
            
            <div className="bg-white p-4 rounded-3xl mb-8 shadow-xl transform hover:scale-105 transition duration-300">
               <QRCode value={`${window.location.origin}/join`} size={220} />
            </div>
            
            <div className="bg-indigo-600/20 border border-indigo-400/30 rounded-2xl p-6 w-full max-w-sm">
                <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-2">Код игры</p>
                <div className="text-7xl font-mono font-black text-white tracking-[0.15em] drop-shadow-lg">
                {sessionData?.code || "..."}
                </div>
            </div>
          </div>

          {/* Правая часть: Участники */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-400" /> 
                    Участники 
                    <span className="bg-white text-indigo-900 px-4 py-1 rounded-full text-xl font-black shadow-lg">
                        {participants.length}
                    </span>
                </h2>
            </div>
            
            <div className="flex-1 bg-black/20 rounded-3xl p-6 overflow-y-auto max-h-[400px] mb-8 border border-white/5 shadow-inner">
                {participants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-30" />
                        <p className="text-lg">Ждем первых игроков...</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        <AnimatePresence>
                            {participants.map((p, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ scale: 0, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    className="bg-white text-slate-900 px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-3"
                                >
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    {p.nickname}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <button 
                onClick={startGame} 
                disabled={participants.length === 0}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-2xl transition flex items-center justify-center gap-4 shadow-xl shadow-indigo-900/50"
            >
               <Play className="w-8 h-8 fill-current" /> НАЧАТЬ ИГРУ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ИГРА / РАЗБОР / ФИНИШ ---
  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          
          {/* === HEADER (Sticky) === */}
          <div className="sticky top-4 z-50 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200/60 flex justify-between items-center mb-8 transition-all">
              <div>
                  {/* Status Badges */}
                  {status === "active" && (
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mb-2 animate-pulse">
                          <div className="w-2 h-2 bg-green-600 rounded-full" /> LIVE
                      </div>
                  )}
                  {status === "review" && (
                      <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold mb-2">
                          <BookOpen className="w-4 h-4" /> REVIEW
                      </div>
                  )}
                  {status === "completed" && (
                      <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold mb-2">
                          <Crown className="w-4 h-4" /> FINISH
                      </div>
                  )}
                  
                  <h1 className="text-3xl font-black text-slate-900 leading-none">
                      {status === "active" ? "Таблица лидеров" : 
                       status === "review" ? "Разбор вопросов" : "Победители"}
                  </h1>
              </div>
              
              {/* Controls */}
              <div className="flex gap-3">
                  {status === "active" && (
                      <button 
                        onClick={startReview} 
                        className="bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
                      >
                          <StopCircle className="w-5 h-5" /> Завершить и разобрать
                      </button>
                  )}
                  
                  {status === "review" && (
                      <button 
                        onClick={finishGame} 
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-200"
                      >
                          К награждению <ArrowRight className="w-5 h-5" />
                      </button>
                  )}

                  {status === "completed" && (
                      <button onClick={() => router.push("/teacher-dashboard")} className="bg-slate-800 text-white hover:bg-slate-900 px-6 py-3 rounded-xl font-bold transition">
                           Выйти в меню
                      </button>
                  )}
              </div>
          </div>

          {/* === MAIN CONTENT === */}

          {/* 1. ФАЗА РАЗБОРА (REVIEW) */}
          {status === "review" && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {cards.map((card, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={card._id || card.id} 
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden"
                     >
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                        <div className="flex gap-6">
                            <span className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">{card.question || card.front}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Варианты ответов */}
                                    {card.options ? (
                                        card.options.map((opt: string, i: number) => {
                                            const isCorrect = card.correct_answers?.includes(i);
                                            return (
                                                <div key={i} className={clsx(
                                                    "p-4 rounded-xl border-2 font-medium flex items-center justify-between transition-all",
                                                    isCorrect 
                                                        ? "bg-green-50 border-green-400 text-green-800 shadow-sm" 
                                                        : "bg-white border-slate-100 text-slate-400 opacity-60"
                                                )}>
                                                    <span>{opt}</span>
                                                    {isCorrect && <Check className="w-6 h-6 text-green-600 bg-green-100 rounded-full p-1" />}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        // Если это флеш-карта
                                        <div className="col-span-2 bg-green-50 border-2 border-green-200 p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Правильный ответ</p>
                                            <p className="text-xl font-bold text-green-900">{card.back}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                     </motion.div>
                 ))}
             </div>
          )}

          {/* 2. ФАЗА ПОДИУМА (COMPLETED) */}
          {status === "completed" && top3.length > 0 && (
             // ИЗМЕНЕНИЕ ЗДЕСЬ: 
             // 1. pt-10 -> pt-20 (или pt-24): опускаем весь подиум ниже
             // 2. h-[450px] -> h-[550px]: даем больше места для высоких столбцов
             <div className="mb-16 pt-24"> 
                 <div className="flex justify-center items-end gap-4 h-[550px]">
                     
                     {/* 2nd Place */}
                     {top3[1] && (
                         <motion.div 
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="flex flex-col items-center w-1/3 max-w-[220px]"
                         >
                            <div className="mb-4 text-center">
                                 <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-2xl text-slate-500 shadow-inner">
                                    {top3[1].nickname.charAt(0)}
                                 </div>
                                 <p className="font-bold text-slate-700 text-xl truncate w-full">{top3[1].nickname}</p>
                                 <p className="font-black text-indigo-500">{Math.round(top3[1].score)}</p>
                            </div>
                            <div className="w-full h-56 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-3xl border-t border-white/50 flex items-center justify-center shadow-2xl relative">
                                 <span className="text-7xl font-black text-white/50 drop-shadow-md">2</span>
                            </div>
                         </motion.div>
                     )}

                     {/* 1st Place */}
                     {top3[0] && (
                         <motion.div 
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, type: "spring", stiffness: 120 }}
                            // Добавил -mt-12, чтобы визуально подтянуть его выше, если нужно, 
                            // но благодаря pt-24 у родителя, корона не обрежется.
                            className="flex flex-col items-center w-1/3 max-w-[260px] z-20 -mx-6 pb-2"
                         >
                            <Crown className="w-20 h-20 text-yellow-400 mb-6 animate-bounce drop-shadow-lg" fill="currentColor" />
                            <div className="mb-4 text-center">
                                 <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-4xl text-yellow-600 shadow-inner border-4 border-yellow-300">
                                    {top3[0].nickname.charAt(0)}
                                 </div>
                                 <p className="font-bold text-slate-900 text-3xl truncate w-full">{top3[0].nickname}</p>
                                 <p className="font-black text-indigo-600 text-2xl">{Math.round(top3[0].score)} PTS</p>
                            </div>
                            <div className="w-full h-80 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-3xl border-t border-white/50 flex items-center justify-center shadow-2xl relative ring-8 ring-yellow-400/20">
                                 <span className="text-9xl font-black text-white/50 drop-shadow-md">1</span>
                                 
                                 <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
                                     <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full opacity-50"></div>
                                     <div className="absolute top-10 right-10 w-3 h-3 bg-white rounded-full opacity-30"></div>
                                 </div>
                            </div>
                         </motion.div>
                     )}

                     {/* 3rd Place */}
                     {top3[2] && (
                         <motion.div 
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="flex flex-col items-center w-1/3 max-w-[220px]"
                         >
                            <div className="mb-4 text-center">
                                 <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-2xl text-orange-600 shadow-inner">
                                    {top3[2].nickname.charAt(0)}
                                 </div>
                                 <p className="font-bold text-slate-700 text-xl truncate w-full">{top3[2].nickname}</p>
                                 <p className="font-black text-indigo-500">{Math.round(top3[2].score)}</p>
                            </div>
                            <div className="w-full h-40 bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-3xl border-t border-white/50 flex items-center justify-center shadow-2xl">
                                 <span className="text-6xl font-black text-white/50 drop-shadow-md">3</span>
                            </div>
                         </motion.div>
                     )}
                 </div>
             </div>
          )}

          {/* 3. СПИСОК РЕЗУЛЬТАТОВ (Отображается в ACTIVE и COMPLETED, но скрыт в REVIEW) */}
          {status !== "review" && (
              <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                  {sortedResults.length === 0 && (
                      <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300 text-slate-400 font-medium">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          Пока нет ответов...
                      </div>
                  )}
                  
                  <AnimatePresence>
                  {sortedResults.map((r, i) => {
                      const total = r.correct + r.incorrect;
                      
                      return (
                          <motion.div 
                              layout 
                              key={r.nickname} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={clsx(
                                  "bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-6 transition-all",
                                  status === 'completed' && i < 3 
                                    ? "border-indigo-200 bg-indigo-50/50 shadow-md transform scale-[1.02]" 
                                    : "border-slate-100 hover:border-slate-300"
                              )}
                          >
                              <div className={clsx(
                                  "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm",
                                  i === 0 ? "bg-yellow-400 text-white" :
                                  i === 1 ? "bg-slate-300 text-white" :
                                  i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500"
                              )}>
                                  {i + 1}
                              </div>
                              
                              <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="font-bold text-xl text-slate-800">{r.nickname}</span>
                                      <div className="flex items-center gap-2">
                                          <Zap className="w-4 h-4 text-indigo-400 fill-current" />
                                          <span className="font-black text-indigo-600 text-2xl">{Math.round(r.score)}</span>
                                      </div>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                      <div className="h-full bg-green-500 transition-all duration-700 ease-out" style={{ width: `${(r.correct / Math.max(total, 1)) * 100}%` }} />
                                      <div className="h-full bg-red-400 transition-all duration-700 ease-out" style={{ width: `${(r.incorrect / Math.max(total, 1)) * 100}%` }} />
                                  </div>
                                  <div className="flex justify-between mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                      <span>{r.correct} Верно</span>
                                      <span>{r.incorrect} Ошибок</span>
                                  </div>
                              </div>
                          </motion.div>
                      )
                  })}
                  </AnimatePresence>
              </div>
          )}
      </div>
    </div>
  );
}