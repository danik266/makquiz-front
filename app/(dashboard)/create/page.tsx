"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Brain, Upload, Sparkles, Loader2,
  Plus, X, Edit3, ArrowLeft,
  Check, Wand2, Save, FileText, BookOpen, Lightbulb,
  Calendar, Clock, Settings, Trash2, CheckCircle2,
  Cloud, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const API_BASE_URL = "https://makquiz-back.onrender.com";

interface Card {
  front: string;
  back: string;
  image_query?: string;
  image_url?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answers: number[];
  explanation?: string;
  image_query?: string;
  image_url?: string;
}

type ContentItem = Card | QuizQuestion;

type GenerationMode = "file" | "text" | "topic" | "manual";
type LearningMode = "all_at_once" | "spaced";
type ContentType = "flashcards" | "quiz";

const AUTOSAVE_KEY = "deck_autosave";
const AUTOSAVE_INTERVAL = 10000;

export default function CreateDeck() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState<"setup" | "input" | "preview" | "edit">("setup");
  const [loading, setLoading] = useState(false);

  const [contentType, setContentType] = useState<ContentType>("flashcards");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("text");
  const [learningMode, setLearningMode] = useState<LearningMode>("all_at_once");
  const [totalCards, setTotalCards] = useState(20);
  const [cardsPerDay, setCardsPerDay] = useState(5);
  
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [inputText, setInputText] = useState("");
  const [topic, setTopic] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cards, setCards] = useState<ContentItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});
  const [cloudinaryStatus, setCloudinaryStatus] = useState<boolean | null>(null);

  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Для force rerender

  // Проверяем статус Cloudinary при загрузке
  useEffect(() => {
    const checkCloudinary = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/decks/cloudinary-status`);
        const data = await res.json();
        setCloudinaryStatus(data.configured);
      } catch {
        setCloudinaryStatus(false);
      }
    };
    checkCloudinary();
  }, []);

  // === ЗАГРУЗКА ИЗОБРАЖЕНИЯ В CLOUDINARY (через бэкенд) ===
  const uploadImage = async (index: number, file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Поддерживаются только: JPG, PNG, GIF, WebP");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Максимальный размер: 10MB");
      return;
    }

    setImageLoading(prev => ({...prev, [index]: true}));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/decks/upload-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        updateCard(index, "image_url", data.image_url);
        updateCard(index, "image_query", "");
      } else {
        const errorData = await res.json().catch(() => ({ detail: "Ошибка" }));
        alert(`Ошибка: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Ошибка соединения с сервером");
    } finally {
      setImageLoading(prev => ({...prev, [index]: false}));
    }
  };

  // === AI ГЕНЕРАЦИЯ (тоже сохраняется в Cloudinary) ===
  const generateSingleImage = async (index: number) => {
    const card = cards[index] as any;
    const prompt = card.image_query || card.front || card.question;

    if (!prompt) {
      alert("Введите текст запроса для картинки");
      return;
    }

    if (!confirm(`Найти картинку для: "${prompt}"?`)) return;

    setImageLoading(prev => ({...prev, [index]: true}));

    try {
      const res = await fetch(`${API_BASE_URL}/api/decks/generate-image-manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (res.ok) {
        const data = await res.json();
        updateCard(index, "image_url", data.image_url);
      } else {
        alert("Не удалось найти изображение. Попробуйте другой запрос.");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка генерации");
    } finally {
      setImageLoading(prev => ({...prev, [index]: false}));
    }
  };

  // === ЭФФЕКТЫ ===
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const confirmRestore = window.confirm(
          `Найдены несохраненные данные от ${new Date(data.timestamp).toLocaleString()}. Восстановить?`
        );
        if (confirmRestore) {
          setDeckName(data.deckName || "");
          setDeckDescription(data.deckDescription || "");
          setCards(data.cards || []);
          setContentType(data.contentType || "flashcards");
          setGenerationMode(data.generationMode || "text");
          setLearningMode(data.learningMode || "all_at_once");
          setTotalCards(data.totalCards || 20);
          setCardsPerDay(data.cardsPerDay || 5);
          setStep(data.step || "setup");
          setLastSaved(new Date(data.timestamp));
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } catch (e) {
        console.error("Error restoring autosave:", e);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges && (cards.length > 0 || deckName || inputText || topic)) {
        const saveData = {
          deckName, deckDescription, cards, contentType, generationMode,
          learningMode, totalCards, cardsPerDay, step, inputText, topic,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, cards, deckName, deckDescription, inputText, topic, generationMode, learningMode, totalCards, cardsPerDay, step]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [cards, deckName, deckDescription, inputText, topic]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && cards.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, cards]);

  const clearAutosave = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setLastSaved(null);
    setHasUnsavedChanges(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setInputText(event.target?.result as string);
    if (file.type === "application/pdf") {
      alert("PDF файлы будут обработаны на сервере");
    } else {
      reader.readAsText(file);
    }
  };

  const generateCards = async () => {
    if (generationMode === "text" && !inputText.trim()) return;
    if (generationMode === "topic" && !topic.trim()) return;
    if (generationMode === "file" && !uploadedFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      
      if (generationMode === "file" && uploadedFile) {
        formData.append("file", uploadedFile);
        formData.append("mode", "file");
      } else if (generationMode === "topic") {
        formData.append("topic", topic);
        formData.append("mode", "topic");
      } else {
        formData.append("text", inputText);
        formData.append("mode", "text");
      }
      
      formData.append("card_count", totalCards.toString());
      formData.append("learning_mode", learningMode);
      formData.append("content_type", contentType);
      if (learningMode === "spaced") {
        formData.append("cards_per_day", cardsPerDay.toString());
      }

      const res = await fetch(`${API_BASE_URL}/api/decks/generate/preview`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      if (res.status === 401) {
        alert("Сессия истекла");
        router.push("/auth");
        return;
      }

      if (!res.ok) throw new Error("Ошибка генерации");

      const data = await res.json();
      if (data?.cards?.length > 0) {
        setCards(data.cards);
        setStep("preview");
      } else {
        alert("AI не вернул карточек");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const saveDeck = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/decks/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: deckName,
          description: deckDescription,
          cards, content_type: contentType,
          learning_mode: learningMode,
          cards_per_day: learningMode === "spaced" ? cardsPerDay : null,
          total_cards: cards.length,
          generation_mode: generationMode,
          is_public: isPublic
        })
      });
      
      if (!res.ok) throw new Error("Ошибка сохранения");
      clearAutosave();
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Не удалось сохранить");
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (index: number, field: string, value: any) => {
    setCards(prevCards => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
    setRefreshKey(prev => prev + 1);
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const addCard = () => {
    if (contentType === "quiz") {
      setCards([...cards, {
        question: "", options: ["", "", "", ""],
        correct_answers: [0], explanation: "", image_query: ""
      }]);
    } else {
      setCards([...cards, { front: "", back: "", image_query: "" }]);
    }
    setEditingIndex(cards.length);
  };

  // === КОМПОНЕНТ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ===
  const ImageUploader = ({ index, item }: { index: number; item: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasImage = !!item.image_url;
    const isLoading = imageLoading[index];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Изображение
          </label>
          <span className={clsx(
            "text-xs font-medium flex items-center gap-1",
            cloudinaryStatus ? "text-emerald-600" : "text-amber-600"
          )}>
          </span>
        </div>
        
        {/* Превью */}
        {hasImage && (
          <div className="relative group">
            <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
              <img
                src={`${item.image_url}?v=${Date.now()}`}
                alt="Preview"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setModalImageUrl(item.image_url ?? null)}
                onError={(e) => {
                  console.error("Ошибка загрузки изображения:", item.image_url);
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='12'%3EОшибка%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-2xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => updateCard(index, "image_url", "")}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Промпт AI */}
        {generationMode !== "manual" && !hasImage && (
          <input
            type="text"
            value={item.image_query || ""}
            onChange={(e) => updateCard(index, "image_query", e.target.value)}
            placeholder="✨ Описание для AI-поиска..."
            className="w-full bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none transition-all placeholder:text-violet-400"
          />
        )}

        {/* Кнопки */}
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(index, file);
              e.target.value = "";
            }}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !cloudinaryStatus}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]",
              "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500",
              "hover:from-emerald-600 hover:via-green-600 hover:to-teal-600",
              "text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>{hasImage ? "Заменить" : "Загрузить"}</span>
              </>
            )}
          </button>

          {generationMode !== "manual" && (
            <button
              onClick={() => generateSingleImage(index)}
              disabled={isLoading}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
                "hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600",
                "text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>AI Поиск</span>
                </>
              )}
            </button>
          )}
        </div>

        {!hasImage && (
          <p className="text-xs text-slate-400 text-center">
            JPG, PNG, GIF, WebP • Макс. 10MB • Хранится в облаке
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white rounded-full blur-3xl opacity-60" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          
          <div className="flex items-center gap-2">
            {(step === "preview" || step === "edit") && (
              <div className="mr-3 flex items-center gap-2 text-xs">
                {hasUnsavedChanges ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Несохраненные изменения
                  </span>
                ) : lastSaved ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {lastSaved.toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              {["setup", "input", "preview"].map((s) => (
                <div key={s} className={clsx(
                  "h-2 rounded-full transition-all",
                  (step === s || (s === "preview" && step === "edit"))
                    ? "bg-orange-600 w-6" 
                    : "bg-slate-300 w-2"
                )} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 0: Setup */}
          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-200">
                  <Settings className="w-10 h-10 text-orange-600" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-3">Настройте генерацию</h1>
                <p className="text-slate-500 font-medium text-lg">Выберите режим создания</p>
              </div>

              {/* Generation Mode */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">
                  Как создать {contentType === "quiz" ? "тест" : "карточки"}?
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { mode: "file" as const, icon: Upload, title: "Файл", desc: "PDF, DOCX, TXT" },
                    { mode: "text" as const, icon: FileText, title: "Текст", desc: "Вставить вручную" },
                    { mode: "topic" as const, icon: Lightbulb, title: "Тема", desc: "AI создаст" },
                    { mode: "manual" as const, icon: Edit3, title: "Вручную", desc: "Самостоятельно" },
                  ].map(({ mode, icon: Icon, title, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setGenerationMode(mode)}
                      className={clsx(
                        "p-5 rounded-2xl border-2 transition-all text-left hover:scale-[1.02]",
                        generationMode === mode
                          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100"
                          : "border-slate-200 bg-white hover:border-orange-300"
                      )}
                    >
                      <Icon className={clsx("w-7 h-7 mb-2", generationMode === mode ? "text-orange-600" : "text-slate-400")} />
                      <h3 className="font-black text-slate-900">{title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Type */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">Тип контента</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: "flashcards" as const, icon: Brain, title: "Флеш-карточки", desc: "Вопрос и ответ" },
                    { type: "quiz" as const, icon: Sparkles, title: "Тест", desc: "Multiple choice" },
                  ].map(({ type, icon: Icon, title, desc }) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={clsx(
                        "p-5 rounded-2xl border-2 transition-all text-left hover:scale-[1.02]",
                        contentType === type
                          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100"
                          : "border-slate-200 bg-white hover:border-orange-300"
                      )}
                    >
                      <Icon className={clsx("w-7 h-7 mb-2", contentType === type ? "text-orange-600" : "text-slate-400")} />
                      <h3 className="font-black text-slate-900">{title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Mode */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">Режим обучения</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { mode: "all_at_once" as const, icon: BookOpen, title: "Все сразу", desc: "Быстрое изучение" },
                    { mode: "spaced" as const, icon: Calendar, title: "Интервальное", desc: "Каждый день" },
                  ].map(({ mode, icon: Icon, title, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setLearningMode(mode)}
                      className={clsx(
                        "p-5 rounded-2xl border-2 transition-all text-left hover:scale-[1.02]",
                        learningMode === mode
                          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100"
                          : "border-slate-200 bg-white hover:border-orange-300"
                      )}
                    >
                      <Icon className={clsx("w-7 h-7 mb-2", learningMode === mode ? "text-orange-600" : "text-slate-400")} />
                      <h3 className="font-black text-slate-900">{title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Count */}
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">
                  Количество: <span className="text-orange-600">{totalCards}</span>
                </label>
                <input
                  type="range"
                  min="5" max="100" step="5"
                  value={totalCards}
                  onChange={(e) => setTotalCards(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              {learningMode === "spaced" && (
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-4">
                    В день: <span className="text-orange-600">{cardsPerDay}</span>
                  </label>
                  <input
                    type="range"
                    min="1" max="20"
                    value={cardsPerDay}
                    onChange={(e) => setCardsPerDay(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    План: {Math.ceil(totalCards / cardsPerDay)} дней
                  </p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setStep(generationMode === "manual" ? "preview" : "input")}
                className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
              >
                {generationMode === "manual" ? "Создать" : "Продолжить"}
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-200">
                  <Wand2 className="w-10 h-10 text-violet-600" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-3">
                  {generationMode === "file" && "Загрузите файл"}
                  {generationMode === "text" && "Вставьте текст"}
                  {generationMode === "topic" && "Укажите тему"}
                </h1>
              </div>

              {generationMode === "file" && (
                <div className="bg-white/80 border-2 border-dashed border-slate-200 rounded-3xl p-12 mb-6 hover:border-orange-300 transition-all">
                  <input type="file" id="file-upload" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-12 h-12 text-orange-400 mb-4" />
                    {uploadedFile ? (
                      <>
                        <p className="font-black text-slate-900">{uploadedFile.name}</p>
                        <button onClick={(e) => { e.preventDefault(); setUploadedFile(null); }} className="mt-2 text-red-500 text-sm font-bold">Удалить</button>
                      </>
                    ) : (
                      <p className="font-bold text-slate-500">PDF, DOCX, TXT</p>
                    )}
                  </label>
                </div>
              )}

              {generationMode === "text" && (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Вставьте текст..."
                  className="w-full h-80 bg-white border border-slate-200 rounded-2xl p-6 mb-6 resize-none font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                />
              )}

              {generationMode === "topic" && (
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Например: История России, Английский B2..."
                  className="w-full bg-white border text-slate-600 border-slate-200 rounded-2xl py-4 px-6 mb-6 font-bold text-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                />
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("setup")} className="px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50">
                  Назад
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={generateCards}
                  disabled={loading || (generationMode === "text" && !inputText) || (generationMode === "topic" && !topic) || (generationMode === "file" && !uploadedFile)}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Сгенерировать</>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Preview & Edit */}
          {(step === "preview" || step === "edit") && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  {contentType === "quiz" ? "Проверьте вопросы" : "Проверьте карточки"}
                </h1>
                <p className="text-slate-500 font-medium">
                  {cards.length > 0 ? `${cards.length} элементов` : "Добавьте элементы"}
                </p>
              </div>

              {/* Deck info */}
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Название</label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="Название..."
                      className="w-full bg-white border text-slate-700 border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Описание</label>
                    <input
                      type="text"
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      placeholder="Описание..."
                      className="w-full bg-white border text-slate-700 border-slate-200 rounded-xl py-3 px-4 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <span className="font-bold text-slate-700">{isPublic ? "Публичный" : "Приватный"}</span>
                </div>
              </div>

              {/* Cards list */}
              <div className="space-y-4 mb-6">
                {contentType === "quiz" ? (
                  cards.map((item, index) => (
                    <QuizQuestionEditor
                      key={`${index}-${refreshKey}`}
                      question={item as QuizQuestion}
                      index={index}
                      onChange={(updated) => {
                        const newCards = [...cards];
                        newCards[index] = updated;
                        setCards(newCards);
                      }}
                      onDelete={() => deleteCard(index)}
                      ImageUploader={ImageUploader}
                      generationMode={generationMode}
                    />
                  ))
                ) : (
                  cards.map((card, index) => {
                    const flashcard = card as Card;
                    const isEditing = editingIndex === index;
                    
                    return (
                      <motion.div
                        key={`${index}-${refreshKey}`}
                        layout
                        className="bg-white/80 border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all"
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Лицевая</label>
                              <input
                                type="text"
                                value={flashcard.front}
                                onChange={(e) => updateCard(index, "front", e.target.value)}
                                className="w-full bg-white border text-slate-700 border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Обратная</label>
                              <textarea
                                value={flashcard.back}
                                onChange={(e) => updateCard(index, "back", e.target.value)}
                                rows={3}
                                className="w-full bg-white text-slate-700 border border-slate-200 rounded-xl py-3 px-4 font-medium resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none"
                              />
                            </div>
                            
                            <ImageUploader index={index} item={flashcard} />
                            
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" /> Готово
                              </button>
                              <button onClick={() => deleteCard(index)} className="px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            {flashcard.image_url ? (
                              <img 
                                src={`${flashcard.image_url}?v=${Date.now()}`} 
                                alt="" 
                                className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 cursor-pointer"
                                onClick={() => setModalImageUrl(flashcard.image_url ?? null)}
                                onError={(e) => {
                                  console.error("Ошибка загрузки в preview:", flashcard.image_url);
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='12'%3EОшибка%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
                                <span className="text-sm font-black text-orange-600">{index + 1}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-900 truncate">{flashcard.front || "—"}</p>
                              <p className="text-sm text-slate-500 truncate">{flashcard.back || "—"}</p>
                            </div>
                            <button onClick={() => setEditingIndex(index)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              <button
                onClick={addCard}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 hover:border-orange-300 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-6"
              >
                <Plus className="w-5 h-5" />
                Добавить
              </button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={saveDeck}
                disabled={!deckName.trim() || cards.length === 0 || loading}
                className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Сохранить</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Модалка для полноразмерного просмотра */}
      <AnimatePresence>
        {modalImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setModalImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImageUrl}
                alt="Full preview"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setModalImageUrl(null)}
                className="absolute top-4 right-4 bg-white/80 text-slate-800 rounded-full p-2 hover:bg-white"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === РЕДАКТОР ВОПРОСОВ С ЧЕКБОКСАМИ ===
interface QuizQuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onChange: (updated: QuizQuestion) => void;
  onDelete: () => void;
  ImageUploader: React.FC<{ index: number; item: any }>;
  generationMode: GenerationMode;
}

function QuizQuestionEditor({ question, index, onChange, onDelete, ImageUploader, generationMode }: QuizQuestionEditorProps) {
  const updateField = (field: keyof QuizQuestion, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const toggleCorrect = (optIndex: number) => {
    const current = question.correct_answers;
    if (current.includes(optIndex)) {
      if (current.length > 1) {
        updateField("correct_answers", current.filter(i => i !== optIndex));
      }
    } else {
      updateField("correct_answers", [...current, optIndex].sort());
    }
  };

  const updateOption = (optIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = value;
    updateField("options", newOptions);
  };

  const removeOption = (optIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optIndex);
      const newCorrect = question.correct_answers
        .filter(i => i !== optIndex)
        .map(i => i > optIndex ? i - 1 : i);
      updateField("options", newOptions);
      updateField("correct_answers", newCorrect.length > 0 ? newCorrect : [0]);
    }
  };

  return (
    <motion.div layout className="bg-white/80 border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">{index + 1}</span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Вопрос</span>
          </div>
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <input
          type="text"
          value={question.question}
          onChange={(e) => updateField("question", e.target.value)}
          placeholder="Введите вопрос..."
          className="w-full bg-slate-50 border text-slate-800 border-slate-200 rounded-xl py-3 px-4 font-bold text-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none"
        />

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">
            Варианты <span className="text-purple-500">(отметьте правильные)</span>
          </label>
          <div className="space-y-2">
            {question.options.map((opt, optIndex) => {
              const isCorrect = question.correct_answers.includes(optIndex);
              return (
                <div 
                  key={optIndex}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    isCorrect ? "bg-emerald-50 text-slate-800 border-emerald-300" : "bg-white text-slate-800 border-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleCorrect(optIndex)}
                    className={clsx(
                      "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                      isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 hover:border-emerald-400"
                    )}
                  >
                    {isCorrect && <Check className="w-4 h-4" />}
                  </button>
                  
                  <span className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0",
                    isCorrect ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(optIndex, e.target.value)}
                    placeholder={`Вариант ${String.fromCharCode(65 + optIndex)}`}
                    className="flex-1 bg-transparent border-none outline-none font-medium"
                  />
                  
                  {question.options.length > 2 && (
                    <button onClick={() => removeOption(optIndex)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {question.options.length < 6 && (
            <button
              onClick={() => updateField("options", [...question.options, ""])}
              className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-purple-600 hover:border-purple-300 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить вариант
            </button>
          )}
          
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Нажмите чекбокс для выбора правильных ответов
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Объяснение</label>
          <textarea
            value={question.explanation || ""}
            onChange={(e) => updateField("explanation", e.target.value)}
            placeholder="Почему этот ответ правильный?"
            rows={2}
            className="w-full bg-slate-50 border text-slate-800 border-slate-200 rounded-xl py-3 px-4 font-medium resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <ImageUploader index={index} item={question} />
        </div>
      </div>
    </motion.div>
  );
}