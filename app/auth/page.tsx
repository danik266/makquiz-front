"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Brain, Lock, Mail, User, Loader2, ArrowLeft, Sparkles,
  GraduationCap, School, CheckCircle2, XCircle, BookOpen, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Animated blob shape component
const BlobShape = ({ className = "", color = "rgba(255,200,87,0.3)" }: { className?: string; color?: string }) => (
  <motion.div
    animate={{
      scale: [1, 1.1, 1],
      rotate: [0, 10, 0],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl ${className}`}
    style={{ background: color }}
  />
);

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
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error(data.detail || t.auth.serverError);

      if (isLogin) {
        login(data.access_token, data.username, data.role);
      } else {
        setIsLogin(true);
        setNotification({
          type: "success",
          message: t.auth.accountCreated
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

  const inputClasses = "w-full bg-white border border-orange-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm hover:border-orange-300";
  const labelClasses = "block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-amber-300 via-orange-400 to-red-400">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <BlobShape className="w-[500px] h-[500px] top-[-100px] left-[-100px]" color="rgba(255,255,255,0.2)" />
         <BlobShape className="w-[400px] h-[400px] top-[20%] right-[-50px]" color="rgba(255,220,100,0.3)" />
         <BlobShape className="w-[300px] h-[300px] bottom-[20%] left-[10%]" color="rgba(255,100,100,0.2)" />
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[15%] w-16 h-16 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center z-0"
      >
        <BookOpen className="w-8 h-8 text-orange-500" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-48 right-[12%] w-14 h-14 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center z-0"
      >
        <Trophy className="w-7 h-7 text-amber-500" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[35%] right-[20%] w-12 h-12 bg-white/90 rounded-xl shadow-xl flex items-center justify-center z-0"
      >
        <Sparkles className="w-6 h-6 text-red-400" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[30%] left-[8%] w-20 h-20 bg-white/90 rounded-3xl shadow-xl flex items-center justify-center z-0"
      >
        <Brain className="w-10 h-10 text-orange-600" />
      </motion.div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/90 hover:text-white transition-colors z-20 font-bold text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30 hover:border-white/50 hover:bg-white/30">
        <ArrowLeft className="w-4 h-4" /> {t.auth.backHome}
      </Link>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl shadow-orange-200/50 p-8 md:p-10 rounded-[2rem] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-200 transform hover:scale-110 hover:rotate-6 transition-all">
             <Brain className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-black text-center text-slate-900 tracking-tight">
              {isLogin ? t.auth.welcomeBack : t.auth.createAccount}
           </h2>
           <p className="text-center text-slate-600 text-sm mt-2 font-medium max-w-[280px]">
              {isLogin ? t.auth.enterDetails : t.auth.selectRole}
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
                   <label className={labelClasses}>{t.auth.iWantToRegister}</label>
                   <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={clsx(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                          role === "student"
                            ? "border-orange-500 bg-gradient-to-br from-amber-50 to-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-400 hover:border-orange-200"
                        )}
                      >
                        <GraduationCap className={clsx("w-7 h-7 mb-1.5", role === "student" && "text-orange-600")} />
                        <span className="text-xs font-bold">{t.auth.student}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("teacher")}
                        className={clsx(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                          role === "teacher"
                            ? "border-orange-500 bg-gradient-to-br from-amber-50 to-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-400 hover:border-orange-200"
                        )}
                      >
                        <School className={clsx("w-7 h-7 mb-1.5", role === "teacher" && "text-orange-600")} />
                        <span className="text-xs font-bold">{t.auth.teacher}</span>
                      </button>
                   </div>
                </div>

                <div>
                   <label className={labelClasses}>{t.auth.username}</label>
                   <div className="relative">
                     <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                     <input
                       type="text"
                       required
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className={inputClasses}
                       placeholder={t.auth.usernamePlaceholder}
                     />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
             <label className={labelClasses}>{t.auth.email}</label>
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
             <label className={labelClasses}>{t.auth.password}</label>
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
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 flex justify-center items-center gap-2 mt-2 text-white text-base",
              "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-500 hover:via-orange-600 hover:to-red-600"
            )}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {isLogin ? t.auth.signIn : t.auth.signUp}
                {!loading && <Sparkles className="w-4 h-4 opacity-80" />}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600 font-medium">
          <button
            onClick={toggleMode}
            className="hover:text-orange-600 transition-colors"
          >
            {isLogin ? t.auth.firstTime : t.auth.haveAccount}
            <span className="text-orange-600 font-bold underline decoration-2 underline-offset-4 decoration-orange-100 hover:decoration-orange-600 transition-all">
              {isLogin ? t.auth.register : t.auth.login}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        ::selection {
          background-color: #f97316;
          color: white;
        }
      `}</style>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-amber-300 via-orange-400 to-red-400" />}>
        <AuthForm />
      </Suspense>
    </>
  );
}