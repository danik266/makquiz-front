"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // 1. Добавил useRouter
import { Loader2, Check, X, Trophy, Send, Zap, RotateCcw, Eye, Star, Home } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function PlayerPage() {
  const { code } = useParams();
  const router = useRouter(); // 2. Инициализация роутера
  
  // Состояния подключения
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState("waiting");
  
  // Состояния игры
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loadingCards, setLoadingCards] = useState(false);

  // Выбор ответа
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [flashcardChoice, setFlashcardChoice] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Локальный финиш (чтобы не моргало)
  const [isFinished, setIsFinished] = useState(false);

  // Состояние переворота карточки
  const [isFlipped, setIsFlipped] = useState(false);

  // 1. ВХОД
  const joinSession = async () => {
    if (!nickname.trim()) return;
    try {
      const res = await fetch("https://makquiz-back.onrender.com/api/live/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, nickname })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
        setJoined(true);
      } else {
        alert("Не удалось войти. Возможно, игра уже идет или ник занят.");
      }
    } catch (e) { console.error(e); }
  };

  // 2. ЗАГРУЗКА И ОПРОС СТАТУСА
  useEffect(() => {
    if (!joined || !sessionId) return;
    
    setLoadingCards(true);
    fetch(`https://makquiz-back.onrender.com/api/live/${sessionId}/cards`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
          setCards(data);
          setLoadingCards(false);
      })
      .catch(() => setLoadingCards(false));

    const interval = setInterval(async () => {
      if (isFinished) return; 

      try {
        const res = await fetch(`https://makquiz-back.onrender.com/api/live/${sessionId}/status`);
        if (res.ok) {
            const data = await res.json();
            if (data.status === "active") setStatus("active");
            // Если статус review - можно показать заглушку (как в прошлом ответе), или ждать completed
            if (data.status === "completed") {
                setStatus("completed");
                setIsFinished(true);
            }
        }
      } catch (e) { console.error(e); }
    }, 1000);

    return () => clearInterval(interval);
  }, [joined, sessionId, isFinished]);

  // 3. ОТПРАВКА ОТВЕТА
  const submitAnswer = async () => {
    if (!sessionId) return;
    const card = cards[currentIndex];
    
    const isQuiz = card.item_type === "quiz_question" || (Array.isArray(card.options) && card.options.length > 0);

    let isCorrect = false;
    
    if (isQuiz) {
        if (selectedOptionIndex === null) return;
        isCorrect = card.correct_answers.includes(selectedOptionIndex);
    } else {
        if (flashcardChoice === null) return;
        isCorrect = flashcardChoice;
    }

    setIsSubmitting(true);

    try {
        const res = await fetch(`https://makquiz-back.onrender.com/api/live/${sessionId}/answer`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                card_id: card._id || card.id,
                is_correct: isCorrect,
                time_taken: 5,
                nickname: nickname
            })
        });

        if (!res.ok) throw new Error("Server Error");

        const data = await res.json();
        
        if (data.score !== undefined) {
            setScore(data.score); 
        } else {
            if (isCorrect) setScore(s => s + 100);
        }
        
        setSelectedOptionIndex(null);
        setFlashcardChoice(null);
        setIsFlipped(false);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            setIsFinished(true);
        }

    } catch (e) {
        console.error(e);
        alert("Ошибка отправки. Попробуйте еще раз.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- ЭКРАНЫ ---

  if (!joined) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-6">Вход в сессию</h1>
          <input 
            value={nickname} onChange={e => setNickname(e.target.value)} 
            placeholder="Ваше имя"
            className="w-full border-2 text-indigo-600 border-slate-200 rounded-xl px-4 py-4 text-xl font-bold text-center mb-4 focus:border-indigo-600 outline-none"
          />
          <button onClick={joinSession} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition">
            Войти
          </button>
        </div>
      </div>
    );
  }

  // Ожидание старта
  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white text-center p-6">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-400 mb-6" />
        <h2 className="text-3xl font-black mb-2">Ожидание...</h2>
        <p className="text-slate-400 text-xl mb-8">Учитель скоро начнет</p>
        <div className="bg-slate-800 px-8 py-3 rounded-full font-bold text-2xl text-indigo-300 border border-indigo-500/30">
            {nickname}
        </div>
        {loadingCards && <p className="mt-4 text-sm text-slate-500">Подгружаем вопросы...</p>}
      </div>
    );
  }

  // Финиш
  if (isFinished) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center text-white text-center p-6 overflow-hidden relative">
        {/* Фоновые звезды */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <Star className="absolute top-10 left-10 w-12 h-12 text-white animate-pulse" />
            <Star className="absolute bottom-20 right-10 w-8 h-8 text-white animate-pulse delay-75" />
            <Star className="absolute top-1/2 left-20 w-4 h-4 text-white animate-bounce" />
        </div>

        <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
        >
            <Trophy className="w-32 h-32 text-yellow-300 mb-8 drop-shadow-lg" fill="currentColor" />
        </motion.div>

        <h1 className="text-4xl font-black mb-6">Игра окончена!</h1>
        
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl min-w-[300px]"
        >
            <p className="text-sm uppercase font-bold tracking-widest text-indigo-200 mb-2">Ваш итоговый счет</p>
            <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-black text-white drop-shadow-sm">{score}</span>
                <span className="text-3xl font-bold text-indigo-200">PTS</span>
            </div>
        </motion.div>

        {/* 3. КНОПКА ВЫХОДА НА ГЛАВНУЮ */}
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={() => router.push("/")}
            className="mt-12 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xl hover:bg-indigo-50 transition shadow-lg flex items-center gap-2"
        >
            <Home className="w-6 h-6" /> Выйти в меню
        </motion.button>
      </div>
    );
  }

  // ИГРА
  const card = cards[currentIndex];
  if (!card) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const isQuiz = card.item_type === "quiz_question" || (Array.isArray(card.options) && card.options.length > 0);
  const canSubmit = isQuiz ? selectedOptionIndex !== null : (isFlipped && flashcardChoice !== null);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col p-4">
       {/* Верхняя панель */}
       <div className="flex justify-between items-center mb-4 font-bold text-slate-500 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
              <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-900">
                  {currentIndex + 1} / {cards.length}
              </span>
          </div>
          <div className="flex items-center gap-2 text-indigo-600">
              <Zap className="w-5 h-5 fill-indigo-600" />
              <span>{score}</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-32">
          
          <div className="w-full relative perspective-1000 mb-6" style={{ minHeight: '250px' }}>
             
             {isQuiz ? (
                 <div className="bg-white w-full p-8 rounded-3xl shadow-lg text-center min-h-[250px] flex flex-col items-center justify-center border-b-4 border-slate-200">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        {card.question}
                    </h2>
                 </div>
             ) : (
                 <motion.div 
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full min-h-[250px]"
                 >
                    <div className="absolute inset-0 bg-white p-8 rounded-3xl shadow-lg text-center flex flex-col items-center justify-center border-b-4 border-slate-200 backface-hidden">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Вопрос</p>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                            {card.front}
                        </h2>
                    </div>

                    <div 
                        className="absolute inset-0 bg-indigo-900 p-8 rounded-3xl shadow-lg text-center flex flex-col items-center justify-center border-b-4 border-indigo-950 backface-hidden"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <p className="text-xs font-bold text-indigo-300 uppercase mb-4 tracking-widest">Ответ</p>
                        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                            {card.back}
                        </h2>
                    </div>
                 </motion.div>
             )}
          </div>

          {isQuiz ? (
             <div className="grid grid-cols-1 gap-3 w-full">
                {card.options.map((opt: string, i: number) => (
                   <button 
                     key={i} 
                     onClick={() => setSelectedOptionIndex(i)}
                     className={clsx(
                        "p-5 rounded-xl font-bold text-lg transition text-left shadow-sm active:scale-95 border-2",
                        selectedOptionIndex === i 
                            ? "bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-200" 
                            : "bg-white text-slate-700 border-indigo-100 hover:border-indigo-300"
                     )}
                   >
                     {opt}
                   </button>
                ))}
             </div>
          ) : (
             <div className="w-full">
                {!isFlipped ? (
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="w-full bg-white border-2 border-indigo-200 text-indigo-600 py-6 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2"
                    >
                        <Eye className="w-6 h-6" /> Показать ответ
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                                onClick={() => setFlashcardChoice(false)} 
                                className={clsx(
                                    "py-6 rounded-2xl font-black text-xl flex flex-col items-center transition border-4 active:scale-95",
                                    flashcardChoice === false 
                                        ? "bg-red-600 text-white border-red-600 ring-4 ring-red-200"
                                        : "bg-white text-red-600 border-red-100 hover:bg-red-50"
                                )}
                        >
                            <X className="mb-2 w-8 h-8"/> Не знал
                        </button>
                        <button 
                                onClick={() => setFlashcardChoice(true)} 
                                className={clsx(
                                    "py-6 rounded-2xl font-black text-xl flex flex-col items-center transition border-4 active:scale-95",
                                    flashcardChoice === true 
                                        ? "bg-green-600 text-white border-green-600 ring-4 ring-green-200"
                                        : "bg-white text-green-600 border-green-100 hover:bg-green-50"
                                )}
                        >
                            <Check className="mb-2 w-8 h-8"/> Знал
                        </button>
                    </div>
                )}
             </div>
          )}
       </div>

       {(canSubmit) && (
           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 animate-in slide-in-from-bottom-10">
               <div className="max-w-2xl mx-auto">
                   <button
                     onClick={submitAnswer}
                     disabled={isSubmitting}
                     className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                   >
                     {isSubmitting ? (
                         <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                         <>Следующий <Send className="w-5 h-5" /></>
                     )}
                   </button>
               </div>
           </div>
       )}
    </div>
  );
}