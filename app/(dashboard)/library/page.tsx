"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Plus, MoreVertical, PlayCircle } from "lucide-react";
// Импортируем компонент Sidebar (проверьте путь, если он отличается)
import Sidebar from "@/components/Sidebar"; 

export default function LibraryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("https://makquiz-back.onrender.com/api/decks/my", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setDecks(data));
  }, [token]);

  return (
    // 1. Делаем flex-контейнер для расположения Сайдбара и Контента рядом
    <div className="flex min-h-screen bg-[#F8F9FC]">
      
      {/* 2. Вставляем Сайдбар */}
      <Sidebar />

      {/* 3. Оборачиваем основной контент в main */}
      {/* w-full flex-1: занимает всю оставшуюся ширину */}
      {/* pt-20: отступ сверху на мобилках (чтобы не заезжало под шапку) */}
      {/* md:pt-8: на десктопе отступ сверху обычный */}
      <main className="w-full flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="text-slate-500" />
                </button>
                <h1 className="text-3xl font-black text-slate-900">Моя библиотека</h1>
            </div>
            <button 
                onClick={() => router.push("/create")} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-transform"
            >
                <Plus className="w-5 h-5" /> 
                <span className="hidden sm:inline">Создать</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
                <div key={String(deck._id || deck.id)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2">
                                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md">Моя колода</span>
                                {deck.content_type === "quiz" ? (
                                    <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-md">Квиз</span>
                                ) : (
                                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">Карточки</span>
                                )}
                            </div>
                            <button className="p-1 hover:bg-slate-50 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{deck.name}</h3>
                        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{deck.description}</p>
                    </div>
                    
                    <button 
                        onClick={() => router.push(`/study/${deck._id || deck.id}`)}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 py-3 rounded-xl font-bold transition-colors"
                    >
                        <PlayCircle className="w-5 h-5" /> Учить
                    </button>
                </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}