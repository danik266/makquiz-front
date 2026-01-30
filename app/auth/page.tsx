"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Brain, Lock, Mail, User, Loader2, ArrowLeft, Sparkles, 
  GraduationCap, School, CheckCircle2, XCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

function AuthForm() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const toggleMode = () => {
    setNotification(null);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { ...formData, role }; 

    try {
      const res = await fetch(`https://makquiz-back.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Ошибка сервера");

      if (isLogin) {
        login(data.access_token, data.username, data.role);
      } else {
        setIsLogin(true);
        setNotification({
          type: "success",
          message: "Аккаунт создан! Теперь войдите с вашими данными."
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm hover:border-indigo-200";
  const labelClasses = "block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F8F9FC]">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white rounded-full blur-3xl opacity-80" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-50 blur-[100px] rounded-full mix-blend-multiply" />
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50 blur-[100px] rounded-full mix-blend-multiply" />
      </div>
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors z-20 font-bold text-sm bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200/50 hover:border-indigo-200">
        <ArrowLeft className="w-4 h-4" /> На главную
      </Link>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(8,112,184,0.07)] p-8 md:p-10 rounded-[2rem] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100 shadow-sm">
             <Brain className="w-8 h-8 text-indigo-600" />
           </div>
           <h2 className="text-3xl font-black text-center text-slate-900 tracking-tight">
              {isLogin ? "С возвращением!" : "Создать аккаунт"}
           </h2>
           <p className="text-center text-slate-500 text-sm mt-2 font-medium max-w-[280px]">
              {isLogin ? "Введите данные для входа" : "Выберите роль и заполните данные"}
           </p>
        </div>

        <AnimatePresence mode="wait">
          {notification && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }} 
              animate={{ opacity: 1, height: 'auto', y: 0 }} 
              exit={{ opacity: 0, height: 0, y: -10 }}
              className={clsx(
                "border text-sm p-4 rounded-xl mb-6 flex items-start gap-3 font-medium",
                notification.type === "error" 
                  ? "bg-red-50 border-red-100 text-red-600" 
                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
              )}
            >
              <div className={clsx(
                  "mt-0.5 shrink-0",
                  notification.type === "error" ? "text-red-500" : "text-emerald-500"
              )}>
                {notification.type === "error" ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                   <label className={labelClasses}>Я хочу зарегистрироваться как:</label>
                   <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={clsx(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
                          role === "student" 
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-300"
                        )}
                      >
                        <GraduationCap className={clsx("w-6 h-6 mb-1", role === "student" && "text-indigo-600")} />
                        <span className="text-xs font-bold">Ученик</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("teacher")}
                        className={clsx(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
                          role === "teacher" 
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-300"
                        )}
                      >
                        <School className={clsx("w-6 h-6 mb-1", role === "teacher" && "text-indigo-600")} />
                        <span className="text-xs font-bold">Учитель</span>
                      </button>
                   </div>
                </div>

                <div>
                   <label className={labelClasses}>Имя пользователя</label>
                   <div className="relative">
                     <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                     <input
                       type="text"
                       required
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className={inputClasses}
                       placeholder="Алекс"
                     />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
             <label className={labelClasses}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClasses}
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div>
             <label className={labelClasses}>Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 mt-2 text-white text-base",
              "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {isLogin ? "Войти" : "Создать аккаунт"}
                {!loading && <Sparkles className="w-4 h-4 opacity-70" />}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500 font-medium">
          <button 
            onClick={toggleMode}
            className="hover:text-indigo-600 transition-colors"
          >
            {isLogin ? "Впервые здесь? " : "Уже есть аккаунт? "}
            <span className="text-indigo-600 font-bold underline decoration-2 underline-offset-4 decoration-indigo-100 hover:decoration-indigo-600 transition-all">
              {isLogin ? "Регистрация" : "Войти"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FC]" />}>
      <AuthForm />
    </Suspense>
  );
}