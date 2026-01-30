"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, Loader2, CheckCircle, Users, Book, MonitorPlay
} from "lucide-react";
import { motion } from "framer-motion";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  
  const [code, setCode] = useState(
    Array.isArray(params?.code) ? params.code[0] || "" : params?.code || ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // --- ЛОГИКА КНОПКИ НАЗАД ---
  const handleBack = () => {
    // Проверяем, есть ли история браузера (больше 1 записи)
    if (window.history.length > 1) {
      router.back(); // Возвращает на предыдущую страницу (Главная или Дашборд)
    } else {
      // Если истории нет (открыли ссылку в новой вкладке), 
      // перенаправляем в зависимости от того, авторизован юзер или нет
      router.push(token ? "/dashboard" : "/");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const cleanCode = code.trim();

    // --- ЛОГИКА 1: LIVE СЕССИЯ (6 цифр) ---
    if (cleanCode.length === 6) {
        router.push(`/live/player/${cleanCode}`);
        return;
    }

    // --- ЛОГИКА 2: ОБЫЧНАЯ КОЛОДА (8 цифр) ---
    if (!token) {
        router.push(`/auth?redirect=/join/${cleanCode}`);
        return;
    }

    try {
      const res = await fetch("https://makquiz-backend.onrender.com/api/teacher/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: cleanCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Ошибка при присоединении");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white rounded-full blur-3xl opacity-80" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={handleBack} // Используем новую функцию
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-100 p-8 rounded-3xl"
        >
          {!result ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <MonitorPlay className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  Вход по коду
                </h1>
                <p className="text-slate-500 font-medium">
                  Введите код с экрана учителя
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="Код игры"
                    className="w-full px-4 py-6 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-center text-4xl font-mono font-black text-indigo-600 tracking-widest placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans placeholder:font-bold placeholder:text-xl"
                    maxLength={8}
                    required
                    autoFocus
                  />
                  <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                    6 цифр для Live-игры • 8 цифр для колоды
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      Подключиться
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {result.already_joined ? "Вы уже подключены!" : "Успешно!"}
              </h2>
              
              <p className="text-slate-600 font-medium mb-6">
                {result.already_joined 
                  ? "У вас уже есть доступ к этой колоде"
                  : `Вы присоединились к колоде "${result.deck_name}"`
                }
              </p>

              <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-indigo-900">
                    Учитель: {result.teacher_name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/study/${result.deck_id}`)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Book className="w-5 h-5" />
                Начать изучение
              </button>

              <button
                onClick={handleBack} // Здесь тоже используем handleBack для удобства
                className="w-full mt-3 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Вернуться назад
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}