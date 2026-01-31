"use client";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext"; 
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Brain, ArrowRight, Sparkles, PlayCircle, CheckCircle2, XCircle, 
  FileText, BarChart3, UploadCloud, GraduationCap, Smartphone, 
  Zap, Menu, X, ChevronRight, Star, Users, Clock,
  BookOpen, Target, Check, Rocket, Heart, Trophy
} from "lucide-react";
import Lenis from "lenis";

// --- WAVE DIVIDER ---
const WaveDivider = ({ color = "#fff", flip = false, className = "" }: { color?: string; flip?: boolean; className?: string }) => (
  <div className={`absolute left-0 right-0 overflow-hidden leading-[0] ${flip ? 'top-0 rotate-180' : 'bottom-0'} ${className}`}>
    <svg 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none" 
      className="relative block w-full h-[60px] md:h-[100px]"
    >
      <path 
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" 
        fill={color}
      />
    </svg>
  </div>
);

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

// --- NAVBAR ---
const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage(); 
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#for-teachers", label: t.nav.forTeachers },
    { href: "#pricing", label: t.nav.pricing },
  ];

  return (
    <>
      <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-5xl ${isScrolled ? 'top-3' : 'top-5'}`}>
        <div className={`relative px-4 py-3 backdrop-blur-xl border shadow-lg rounded-full flex items-center justify-between transition-all duration-300 ${isScrolled ? 'bg-white/95 border-amber-100 shadow-amber-100/50' : 'bg-white/80 border-white/50 shadow-orange-100/30'}`}>
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200 transform group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800 hidden md:block">
              Mak<span className="text-orange-500">quiz</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/join" 
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-orange-600 bg-orange-50 border-2 border-orange-200 rounded-full hover:bg-orange-100 hover:border-orange-300 hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-4 h-4" />
              {t.nav.join} 
            </Link>

            <button 
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} 
              className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 uppercase transition-all"
            >
              {language}
            </button>
            
            {!isAuthenticated ? (
              <>
                <Link href="/auth?mode=login" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors px-3 py-2">
                  {t.nav.login}
                </Link>
                <Link 
                  href="/auth?mode=register" 
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
                >
                  {t.nav.start}
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors px-3 py-2">
                  {t.nav.dashboard}
                </Link>
                <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-600 px-3 py-2">
                  {t.nav.logout}
                </button>
              </>
            )}
          </div>
          
          {/* MOBILE */}
          <div className="flex items-center gap-3 md:hidden">
             <Link 
                href="/join" 
                className="p-2.5 text-orange-600 bg-orange-50 rounded-full"
              >
                <Zap className="w-4 h-4" />
            </Link>

            <button 
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 flex flex-col gap-2 md:hidden"
            >
              {navLinks.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center text-slate-700 font-bold hover:bg-orange-50 rounded-2xl transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-orange-100 my-2" />
              
              <button 
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} 
                className="p-3 text-center font-bold text-slate-500"
              >
                {language === 'en' ? '🇷🇺 Русский' : '🇬🇧 English'}
              </button>

              {!isAuthenticated ? (
                <>
                  <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-bold text-slate-700 hover:bg-slate-50 rounded-2xl">
                    {t.nav.login}
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-bold text-white bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl">
                    {t.nav.start}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-bold text-orange-600 hover:bg-orange-50 rounded-2xl">
                    {t.nav.dashboard}
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="p-3 text-center font-bold text-red-500">
                    {t.nav.logout}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

// --- HERO ---
function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-red-400" />
      
      {/* Animated blobs (без изменений) */}
      <BlobShape className="w-[500px] h-[500px] top-[-100px] left-[-100px]" color="rgba(255,255,255,0.2)" />
      <BlobShape className="w-[400px] h-[400px] top-[20%] right-[-50px]" color="rgba(255,220,100,0.3)" />
      <BlobShape className="w-[300px] h-[300px] bottom-[20%] left-[10%]" color="rgba(255,100,100,0.2)" />
      
      {/* Floating elements (без изменений) */}
      <div className="hidden sm:block">
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[15%] w-16 h-16 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center"
        >
          <BookOpen className="w-8 h-8 text-orange-500" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-48 right-[12%] w-14 h-14 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center"
        >
          <Trophy className="w-7 h-7 text-amber-500" />
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 pb-20 md:pt-40"> {/* Уменьшил padding для мобилок */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto w-full flex flex-col items-center"
        >
          {/* MAIN HEADLINE */}
          {/* Используем flex-col для общих строк, но внутри каждой строки контролируем поток */}
          <h1 className="flex flex-col items-center font-black tracking-tight text-white drop-shadow-lg mb-8">
            
            {/* СТРОКА 1: Stop Memorizing */}
            {/* flex-wrap позволяет словам оставаться вместе, но переноситься если экран ОЧЕНЬ узкий */}
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-5xl sm:text-6xl md:text-7xl xl:text-8xl mb-2 md:mb-4">
              <span>{t.hero.titleStart}</span>
              
              <div className="relative inline-block px-1">
                {/* Текст (полупрозрачный) */}
                <span className="relative z-0 text-white/50">{t.hero.titleStrike}</span>
                {/* Линия зачеркивания */}
                <span className="absolute left-[-5%] top-1/2 w-[110%] h-[3px] md:h-[6px] bg-white/90 -translate-y-1/2 z-20 rounded-full rotate-[-3deg] shadow-sm" />
              </div>
            </div>

            {/* СТРОКА 2: Start Understanding */}
            {/* Увеличенный margin-top (mt-4), чтобы карточка не наезжала на верхнюю строку */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-4 text-5xl sm:text-6xl md:text-7xl xl:text-8xl mt-4 sm:mt-2">
              <span>{t.hero.titleEnd}</span>
              
              {/* Белая плашка */}
              <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <span className="relative z-10 bg-white text-orange-500 px-4 py-2 md:px-6 md:py-1 rounded-xl md:rounded-2xl shadow-xl inline-block border-b-4 border-orange-200 whitespace-nowrap">
                  {t.hero.titleHighlight}
                </span>
              </div>
            </div>

          </h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium mb-10 px-4"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4"
          >
            <Link 
              href="/auth?mode=register" 
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 font-bold text-orange-600 transition-all bg-white rounded-full hover:shadow-2xl hover:shadow-orange-900/20 hover:-translate-y-1 active:translate-y-0"
            >
              <span className="flex items-center gap-2 text-lg">
                {t.hero.btnPrimary}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white font-bold bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <span>{t.hero.btnSecondary}</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 md:mt-16 flex flex-wrap justify-center gap-4 w-full"
        >
          {[
            { value: "50K+", label: t.hero.stats.students, icon: Users },
            { value: "2M+", label: t.hero.stats.cards, icon: BookOpen },
            { value: "94%", label: t.hero.stats.accuracy, icon: Target },
          ].map((stat, i) => (
            <div key={i} className="flex-1 min-w-[140px] max-w-[200px] flex flex-col md:flex-row items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-4 border border-white/20">
              <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/80 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Wave */}
      <WaveDivider color="#fffbeb" />
    </section>
  );
}


// --- COMPARISON ---
function ComparisonSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 px-4 bg-amber-50 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {t.comparison.subtitle}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight"
          >
            {t.comparison.title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="relative p-8 md:p-10 rounded-[2rem] bg-white border-2 border-red-100 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800">{t.comparison.old.title}</h3>
            </div>
            <ul className="space-y-5">
              {t.comparison.old.points.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium text-lg">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* New Way */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="relative p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-2xl shadow-orange-200"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">{t.comparison.new.title}</h3>
            </div>
            <ul className="space-y-5">
              {t.comparison.new.points.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white/95 font-medium text-lg">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- WORKFLOW ---
function WorkflowSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: targetRef,
    offset: ["start start", "end end"] 
  });
  const { t } = useLanguage();
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const update = () => {
      if (scrollContainerRef.current) {
        setScrollRange(scrollContainerRef.current.scrollWidth - window.innerWidth);
      }
    };
    
    const timer = setTimeout(update, 100);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(timer);
    };
  }, [t]);

  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);
  
  const steps = [
    { id: "01", icon: UploadCloud, title: t.workflow.step1.title, desc: t.workflow.step1.desc, bg: "bg-sky-400", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
    { id: "02", icon: Brain, title: t.workflow.step2.title, desc: t.workflow.step2.desc, bg: "bg-violet-500", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
    { id: "03", icon: Zap, title: t.workflow.step3.title, desc: t.workflow.step3.desc, bg: "bg-amber-400", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { id: "04", icon: BarChart3, title: t.workflow.step4.title, desc: t.workflow.step4.desc, bg: "bg-emerald-500", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh]">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
      
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div 
          ref={scrollContainerRef} 
          style={{ x }} 
          className="flex gap-6 md:gap-10 px-6 md:px-20 items-center min-w-max"
        >
          {/* Intro Card */}
          <div className="w-[85vw] sm:w-[70vw] md:w-[420px] shrink-0 pr-4 md:pr-8">
            <div className="w-20 h-2 bg-gradient-to-r from-amber-400 to-orange-500 mb-8 rounded-full" />
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
              {t.workflow.title}
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {t.workflow.highlight}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 mb-8 font-medium">{t.workflow.subtitle}</p>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span className="animate-pulse">Scroll</span>
              <ArrowRight className="w-4 h-4 animate-bounce" style={{ animationDirection: 'alternate' }} />
            </div>
          </div>

          {/* Step Cards */}
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="group relative w-[85vw] sm:w-[70vw] md:w-[380px] lg:w-[400px] h-[450px] md:h-[500px] shrink-0"
            >
              <div className={`absolute inset-0 ${step.bg} rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl`}>
                {/* Top */}
                <div>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6 md:mb-8 ${step.iconColor} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                    <step.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-base md:text-lg text-white/90 leading-relaxed font-medium">{step.desc}</p>
                </div>
                
                {/* Bottom */}
                <div className="flex justify-between items-end pt-6 border-t border-white/20">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Step</span>
                  <span className="text-7xl md:text-8xl font-black text-white/20 select-none">
                    {step.id}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="w-[85vw] sm:w-[70vw] md:w-[380px] lg:w-[400px] h-[450px] md:h-[500px] shrink-0">
            <Link 
              href="/auth?mode=register" 
              className="group w-full h-full rounded-[2.5rem] bg-slate-900 text-white flex flex-col items-center justify-center gap-6 relative overflow-hidden shadow-2xl hover:shadow-slate-400/30 transition-all hover:-translate-y-3"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.3),transparent_50%)]" />
              <div className="relative z-10 w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400 transition-all">
                <Rocket className="w-10 h-10 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="relative z-10 text-2xl md:text-3xl font-black">{t.workflow.cta}</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- FEATURES ---
function FeatureGrid() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 md:py-32 px-4 bg-white relative z-10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <BlobShape className="w-[600px] h-[600px] -top-[200px] -right-[200px]" color="rgba(251,191,36,0.15)" />
        <BlobShape className="w-[400px] h-[400px] bottom-[10%] -left-[100px]" color="rgba(239,68,68,0.1)" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-bold mb-6"
          >
            <Star className="w-4 h-4" />
            {t.features.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6"
          >
            {t.features.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto"
          >
            {t.features.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Main Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2"
          >
            <div className="h-full rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 p-8 md:p-10 shadow-xl shadow-violet-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold mb-6">
                <Brain className="w-3.5 h-3.5" /> {t.features.analysis.badge}
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4">{t.features.analysis.title}</h3>
              <p className="text-lg text-white/80 max-w-lg mb-8">{t.features.analysis.desc}</p>
              
              {/* Chart */}
              <div className="w-full h-32 md:h-40 flex items-end justify-between gap-2 md:gap-3 px-4">
                {[40, 60, 45, 75, 55, 90, 70, 100].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-xl ${i === 7 ? 'bg-white shadow-lg' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="h-full min-h-[280px] rounded-[2rem] bg-sky-400 p-8 shadow-xl shadow-sky-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-sky-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">{t.features.mobile.title}</h3>
                <p className="text-white/80 font-medium">{t.features.mobile.desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Teachers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-full min-h-[280px] rounded-[2rem] bg-amber-400 p-8 shadow-xl shadow-amber-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">{t.features.teachers.title}</h3>
                <p className="text-white/80 font-medium">{t.features.teachers.desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Spaced Repetition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-full min-h-[280px] rounded-[2rem] bg-emerald-500 p-8 shadow-xl shadow-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <Clock className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">{t.features.spaced.title}</h3>
                <p className="text-white/80 font-medium">{t.features.spaced.desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <div className="rounded-[2rem] bg-slate-900 p-8 md:p-10 shadow-2xl hover:shadow-slate-400/20 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">{t.features.files.title}</h3>
                  <p className="text-slate-400 text-lg">{t.features.files.desc}</p>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="p-4 md:p-5 bg-white/10 rounded-2xl">
                    <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="p-4 md:p-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30">
                    <UploadCloud className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="p-4 md:p-5 bg-white/10 rounded-2xl">
                    <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- TEACHERS ---
function TeachersSection() {
  const { t } = useLanguage();

  return (
    <section id="for-teachers" className="py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-sky-500" />
      <BlobShape className="w-[500px] h-[500px] top-[-100px] right-[-100px]" color="rgba(255,255,255,0.2)" />
      <BlobShape className="w-[400px] h-[400px] bottom-[-100px] left-[-100px]" color="rgba(255,255,255,0.15)" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 text-white text-sm font-bold mb-6">
              <GraduationCap className="w-4 h-4" />
              {t.teachers_section.badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              {t.teachers_section.title}
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              {t.teachers_section.desc}
            </p>
            
            <div className="space-y-6">
              {t.teachers_section.points.map((item: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-teal-500 transition-all shrink-0">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-white">{item.title}</h4>
                    <p className="text-white/70">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link 
              href="/auth?mode=register" 
              className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-white text-teal-600 font-bold rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {t.teachers_section.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          
          {/* Preview Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100" />
                  <div className="w-24 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50" />
                  <div className="w-8 h-8 rounded-xl bg-slate-50" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-28 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-teal-600">24</div>
                    <div className="text-xs text-slate-400 font-medium">Students Online</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-20 bg-amber-50 rounded-xl border border-amber-100 p-3">
                    <div className="text-xs text-amber-600 font-bold mb-1">Avg. Score</div>
                    <div className="text-xl font-black text-amber-700">87%</div>
                  </div>
                  <div className="flex-1 h-20 bg-emerald-50 rounded-xl border border-emerald-100 p-3">
                    <div className="text-xs text-emerald-600 font-bold mb-1">Completed</div>
                    <div className="text-xl font-black text-emerald-700">156</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- PRICING ---
function PricingSection() {
  const { t } = useLanguage();
  const [isTeacher, setIsTeacher] = useState(false);

  // @ts-ignore
  const currentPlans = isTeacher ? t.pricing.teacherPlans : t.pricing.studentPlans;

  return (
    <section id="pricing" className="py-20 md:py-32 px-4 bg-amber-50 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm font-bold mb-6"
          >
            <Heart className="w-4 h-4" />
            {t.pricing.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-4"
          >
            {t.pricing.title}
          </motion.h2>
          <p className="text-lg md:text-xl text-slate-500">{t.pricing.subtitle}</p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span 
              className={`font-bold transition-colors cursor-pointer select-none ${!isTeacher ? 'text-orange-600' : 'text-slate-400'}`}
              onClick={() => setIsTeacher(false)}
            >
              {t.pricing.toggles.students}
            </span>
            
            <button 
              onClick={() => setIsTeacher(!isTeacher)}
              className={`relative w-16 h-9 rounded-full transition-colors focus:outline-none ${isTeacher ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform ${isTeacher ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            
            <span 
              className={`font-bold transition-colors cursor-pointer select-none ${isTeacher ? 'text-orange-600' : 'text-slate-400'}`}
              onClick={() => setIsTeacher(true)}
            >
              {t.pricing.toggles.teachers}
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8">
          <AnimatePresence mode='wait'>
            {currentPlans.map((plan: any, i: number) => (
              <motion.div
                key={`${isTeacher ? 'teacher' : 'student'}-${i}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`relative p-6 md:p-8 rounded-[2rem] transition-all duration-300 w-full md:w-[380px] ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-2xl shadow-orange-200 scale-105 z-10' 
                    : 'bg-white border-2 border-slate-200 hover:shadow-xl hover:border-orange-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                    🔥 Popular
                  </div>
                )}
                
                <h3 className={`text-xl font-black mb-2 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-white/80' : 'text-slate-500'}`}>{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl md:text-5xl font-black ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.price}</span>
                  <span className={plan.popular ? 'text-white/70' : 'text-slate-400'}>{plan.period}</span>
                </div>
                
                <Link 
                  href="/auth?mode=register" 
                  className={`block w-full py-4 rounded-full text-center font-bold transition-all ${
                    plan.popular 
                      ? 'bg-white text-orange-600 hover:shadow-lg' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature: string, j: number) => (
                    <li key={j} className={`flex items-center gap-3 text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600'}`}>
                      <Check className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-white' : 'text-orange-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// --- TESTIMONIALS ---
function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 px-4 bg-white relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-sm font-bold mb-6"
          >
            <Heart className="w-4 h-4" />
            {t.testimonials.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight"
          >
            {t.testimonials.title}
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 md:p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed font-medium">"{item.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-200" />
                <div>
                  <div className="font-black text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- CTA ---
function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white text-center overflow-hidden shadow-2xl shadow-orange-200"
        >
          {/* Decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
          <BlobShape className="w-[300px] h-[300px] -bottom-[100px] -right-[100px]" color="rgba(255,255,255,0.2)" />
          
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <Rocket className="w-16 h-16 text-white" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">{t.cta.title}</h2>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">{t.cta.subtitle}</p>
            
            <Link 
              href="/auth?mode=register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="text-sm text-white/60 mt-4">{t.cta.note}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- FOOTER ---
function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-16 bg-slate-900 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl">Makquiz</span>
            </div>
            <p className="text-slate-400 text-sm">{t.footer.tagline}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.footer.product}</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.features}</Link></li>
              <li><Link href="#pricing" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.pricing}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.mobile}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.about}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.careers}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.blog}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.privacy}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.terms}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-orange-400 transition-colors">{t.footer.links.contact}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE ---
export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 1024) {
      const lenis = new Lenis({ 
        duration: 1.2, 
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      return () => lenis.destroy();
    }
  }, []);

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
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
      
      <main className="min-h-screen bg-white text-slate-900 antialiased overflow-clip">
        <Navbar />
        <HeroSection />
        <ComparisonSection />
        <WorkflowSection />
        <FeatureGrid />
        <TeachersSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}