"use client";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext"; 
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { 
  Brain, ArrowRight, ArrowDown,Sparkles, PlayCircle, CheckCircle2, XCircle, 
  FileText, BarChart3, UploadCloud, GraduationCap, Smartphone, 
  Zap, Menu, X, ChevronRight, CheckSquare, Star, Users, Clock,
  BookOpen, Target, Award, Globe, Check
} from "lucide-react";
import Lenis from "lenis";

// --- BACKGROUNDS ---
const NoiseOverlay = () => (
  <div className="fixed inset-0 z-[1] opacity-[0.03] pointer-events-none"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
);

const GradientOrbs = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/40 to-indigo-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-[150px]" />
  </div>
);

const GridPattern = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4]"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
);

// --- UI COMPONENTS ---
function SpotlightCard({ children, className = "", spotlightColor = "rgba(99, 102, 241, 0.15)" }: { children: React.ReactNode; className?: string, spotlightColor?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      ref={divRef}
      className={`group relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(700px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 70%)
          `,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm text-xs font-bold text-slate-600 uppercase tracking-wider ${className}`}
  >
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
    </span>
    {children}
  </motion.div>
);

const SectionTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.h2 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1 }}
    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight ${className}`}
  >
    {children}
  </motion.h2>
);

// --- NAVBAR ---
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
        <div className={`relative px-4 py-3 backdrop-blur-xl border shadow-lg rounded-2xl flex items-center justify-between transition-all duration-300 ${isScrolled ? 'bg-white/90 border-slate-200/80 shadow-slate-200/50' : 'bg-white/70 border-white/50 shadow-slate-100/30'}`}>
          
          {/* ЛОГОТИП */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform group-hover:scale-105 group-hover:rotate-3 transition-all">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 hidden md:block">
              Mak<span className="text-indigo-600">quiz</span>
            </span>
          </Link>

          {/* МЕНЮ ДЕСКТОП (Центр) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* МЕНЮ ДЕСКТОП (Правая часть) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* === 1. КНОПКА JOIN (Для ПК) === */}
            {/* Используем t.nav.join */}
            <Link 
              href="/join" 
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all mr-1"
            >
              <Zap className="w-4 h-4 text-indigo-500" />
              {t.nav.join} 
            </Link>
            {/* ============================== */}

            <button 
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} 
              className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 uppercase transition-all"
            >
              {language}
            </button>
            
            {!isAuthenticated ? (
              <>
                <Link href="/auth?mode=login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2">
                  {t.nav.login}
                </Link>
                <Link 
                  href="/auth?mode=register" 
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all"
                >
                  {t.nav.start}
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2">
                  {t.nav.dashboard}
                </Link>
                <button onClick={logout} className="text-sm font-semibold text-red-500 hover:text-red-600 px-3 py-2">
                  {t.nav.logout}
                </button>
              </>
            )}
          </div>
          
          {/* МОБИЛЬНАЯ ВЕРСИЯ */}
          <div className="flex items-center gap-3 md:hidden">
             
             {/* === 2. КНОПКА JOIN (Для мобильных - в шапке) === */}
             {/* Используем короткую версию t.nav.joinShort ("В игру" / "Join") */}
             <Link 
                  href="/join" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 mb-2"
                >
                  <Zap className="w-4 h-4 text-indigo-500" />
                  {t.nav.join}
              </Link>
             {/* ================================================= */}

            <button 
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ВЫПАДАЮЩЕЕ МЕНЮ (Мобильное) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col gap-1 md:hidden"
            >
              {/* === 3. КНОПКА JOIN (Большая в меню) === */}
              
              {/* ======================================= */}

              <div className="h-px bg-slate-100 my-1" />

              {navLinks.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center text-slate-700 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-1" />
              
              <button 
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} 
                className="p-3 text-center font-semibold text-slate-500"
              >
                {language === 'en' ? '🇷🇺 Русский' : '🇬🇧 English'}
              </button>

              {!isAuthenticated ? (
                <>
                  <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                    {t.nav.login}
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl">
                    {t.nav.start}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl">
                    {t.nav.dashboard}
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="p-3 text-center font-semibold text-red-500">
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
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 pb-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl opacity-60 blur-sm"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-[15%] w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-60 blur-sm"
        />
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-[20%] w-20 h-20 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl opacity-50 blur-sm"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto z-10"
      >
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-tight sm:leading-[1.1] mb-8 text-slate-900">
          {t.hero.titleStart}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-slate-400 line-through decoration-red-500/70 decoration-[3px] md:decoration-4">{t.hero.titleStrike}</span>
          </span>
          <br className="block" />
          {t.hero.titleEnd}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            <motion.span 
              className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg -z-10"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </span>
        </h1>

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium mb-10 px-4"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link 
            href="/auth?mode=register" 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:shadow-2xl hover:shadow-indigo-300/50 hover:-translate-y-1 active:translate-y-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2 text-lg">
              {t.hero.btnPrimary}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-slate-700 font-bold bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <span>{t.hero.btnSecondary}</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 z-10"
      >
        {[
          { value: "50K+", label: t.hero.stats.students, icon: Users },
          { value: "2M+", label: t.hero.stats.cards, icon: BookOpen },
          { value: "94%", label: t.hero.stats.accuracy, icon: Target },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

// --- COMPARISON ---
function ComparisonSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-6">{t.comparison.subtitle}</Badge>
          <SectionTitle>{t.comparison.title}</SectionTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{t.comparison.old.title}</h3>
              </div>
              <ul className="space-y-5">
                {t.comparison.old.points.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* New Way */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SpotlightCard 
              className="h-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl" 
              spotlightColor="rgba(129, 140, 248, 0.15)"
            >
              <div className="p-8 md:p-10 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{t.comparison.new.title}</h3>
                  </div>
                  <ul className="space-y-5">
                    {t.comparison.new.points.map((point: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-medium text-lg">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- WORKFLOW (Horizontal Scroll) ---
function WorkflowSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: targetRef,
    offset: ["start start", "end end"] 
  });
  const { language, t } = useLanguage();
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const update = () => {
      if (scrollContainerRef.current) {
        // Вычисляем, насколько длинный контент внутри
        setScrollRange(scrollContainerRef.current.scrollWidth - window.innerWidth);
      }
    };
    
    // Небольшая задержка, чтобы убедиться, что рендер прошел
    const timer = setTimeout(update, 100);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(timer);
    };
  }, [t]);

  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);
  const steps = [
    { id: "01", icon: UploadCloud, title: t.workflow.step1.title, desc: t.workflow.step1.desc, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", iconColor: "text-blue-500" },
    { id: "02", icon: Brain, title: t.workflow.step2.title, desc: t.workflow.step2.desc, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50", iconColor: "text-violet-500" },
    { id: "03", icon: Zap, title: t.workflow.step3.title, desc: t.workflow.step3.desc, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconColor: "text-amber-500" },
    { id: "04", icon: BarChart3, title: t.workflow.step4.title, desc: t.workflow.step4.desc, gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-slate-50/50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Sticky контейнер. Он "прилипает" к верху, пока мы скроллим 300vh родителя */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div 
          ref={scrollContainerRef} 
          style={{ x }} 
          className="flex gap-6 md:gap-10 px-6 md:px-20 items-center min-w-max"
        >
          {/* Intro Card */}
          <div className="w-[85vw] sm:w-[70vw] md:w-[400px] shrink-0 pr-4 md:pr-8">
            <div className="w-16 h-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 rounded-full" />
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              {t.workflow.title}
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
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
              className="group relative w-[85vw] sm:w-[70vw] md:w-[380px] lg:w-[420px] h-[420px] md:h-[480px] shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 md:p-10 flex flex-col justify-between transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                {/* Top */}
                <div>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 md:mb-8 ${step.iconColor} transition-transform group-hover:scale-110`}>
                    <step.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
                
                {/* Bottom */}
                <div className="flex justify-between items-end pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step</span>
                  <span className={`text-6xl md:text-7xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20 select-none`}>
                    {step.id}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="w-[85vw] sm:w-[70vw] md:w-[380px] lg:w-[420px] h-[420px] md:h-[480px] shrink-0">
            <Link 
              href="/auth?mode=register" 
              className="group w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex flex-col items-center justify-center gap-6 relative overflow-hidden shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:border-white/50 transition-all">
                <ArrowDown className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="relative z-10 text-2xl md:text-3xl font-bold">{t.workflow.cta}</p>
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
    <section id="features" className="py-20 md:py-32 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <Badge className="mb-6">{t.features.badge}</Badge>
          <SectionTitle className="mb-6">{t.features.title}</SectionTitle>
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
          {/* Main Feature - spans 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2"
          >
            <SpotlightCard className="h-full rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8 md:p-10 h-full flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6 self-start">
                  <Brain className="w-3.5 h-3.5" /> {t.features.analysis.badge}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t.features.analysis.title}</h3>
                <p className="text-lg text-slate-500 max-w-lg mb-8">{t.features.analysis.desc}</p>
                
                {/* Animated chart */}
                <div className="mt-auto w-full h-32 md:h-40 flex items-end justify-between gap-2 md:gap-3 px-4">
                  {[40, 60, 45, 75, 55, 90, 70, 100].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`w-full rounded-t-lg ${i === 7 ? 'bg-gradient-to-t from-indigo-600 to-violet-500 shadow-lg shadow-indigo-200' : 'bg-indigo-100'}`}
                    />
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <SpotlightCard className="h-full min-h-[280px] rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">{t.features.mobile.title}</h3>
                  <p className="text-slate-500 font-medium">{t.features.mobile.desc}</p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Teachers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <SpotlightCard className="h-full min-h-[280px] rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">{t.features.teachers.title}</h3>
                  <p className="text-slate-500 font-medium">{t.features.teachers.desc}</p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Spaced Repetition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <SpotlightCard className="h-full min-h-[280px] rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">{t.features.spaced.title}</h3>
                  <p className="text-slate-500 font-medium">{t.features.spaced.desc}</p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Files - full width dark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <SpotlightCard 
              className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl" 
              spotlightColor="rgba(255,255,255,0.08)"
            >
              <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{t.features.files.title}</h3>
                  <p className="text-slate-400 text-lg">{t.features.files.desc}</p>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="p-4 md:p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="p-4 md:p-5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <UploadCloud className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="p-4 md:p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
              </div>
            </SpotlightCard>
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
    <section id="for-teachers" className="py-20 md:py-32 px-4 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6">{t.teachers_section.badge}</Badge>
            <SectionTitle className="mb-6 leading-tight">{t.teachers_section.title}</SectionTitle>
            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
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
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link 
              href="/auth?mode=register" 
              className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
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
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200/50 to-violet-200/50 blur-[60px] rounded-full" />
            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100" />
                  <div className="w-24 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50" />
                  <div className="w-8 h-8 rounded-lg bg-slate-50" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-indigo-600">24</div>
                    <div className="text-xs text-slate-400 font-medium">Students Online</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-20 bg-indigo-50 rounded-xl border border-indigo-100 p-3">
                    <div className="text-xs text-indigo-600 font-bold mb-1">Avg. Score</div>
                    <div className="text-xl font-black text-indigo-700">87%</div>
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
// --- PRICING ---
function PricingSection() {
  const { t } = useLanguage();
  const [isTeacher, setIsTeacher] = useState(false); // false = Студенты, true = Учителя

  // Выбираем правильный массив данных из переводов
  // @ts-ignore (игнорируем ошибку типизации, если типы еще не обновлены)
  const currentPlans = isTeacher ? t.pricing.teacherPlans : t.pricing.studentPlans;

  return (
    <section id="pricing" className="py-20 md:py-32 px-4 bg-slate-50/50 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-6">{t.pricing.badge}</Badge>
          <SectionTitle className="mb-4">{t.pricing.title}</SectionTitle>
          <p className="text-lg md:text-xl text-slate-500">{t.pricing.subtitle}</p>
          
          {/* Toggle: Студентам / Учителям */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span 
              className={`font-semibold transition-colors cursor-pointer select-none ${!isTeacher ? 'text-indigo-600' : 'text-slate-400'}`}
              onClick={() => setIsTeacher(false)}
            >
              {t.pricing.toggles.students}
            </span>
            
            <button 
              onClick={() => setIsTeacher(!isTeacher)}
              className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none ${isTeacher ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isTeacher ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            
            <span 
              className={`font-semibold transition-colors cursor-pointer select-none ${isTeacher ? 'text-indigo-600' : 'text-slate-400'}`}
              onClick={() => setIsTeacher(true)}
            >
              {t.pricing.toggles.teachers}
            </span>
          </div>
        </div>

        {/* Сетка планов */}
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8">
          <AnimatePresence mode='wait'>
            {currentPlans.map((plan: any, i: number) => (
              <motion.div
                key={`${isTeacher ? 'teacher' : 'student'}-${i}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 w-full md:w-[380px] ${
                  plan.popular 
                    ? 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 scale-105 z-10' 
                    : 'bg-white border-slate-200 hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl md:text-5xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 font-medium">{plan.period}</span>
                </div>
                
                <Link 
                  href="/auth?mode=register" 
                  className={`block w-full py-4 rounded-xl text-center font-bold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature: string, j: number) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                      <Check className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-indigo-600' : 'text-slate-400'}`} />
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
          <Badge className="mb-6">{t.testimonials.badge}</Badge>
          <SectionTitle>{t.testimonials.title}</SectionTitle>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">"{item.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100" />
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
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
          className="relative p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white text-center overflow-hidden shadow-2xl shadow-indigo-200"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">{t.cta.title}</h2>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">{t.cta.subtitle}</p>
            
            <Link 
              href="/auth?mode=register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all"
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
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
              <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.features}</Link></li>
              <li><Link href="#pricing" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.pricing}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.mobile}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.about}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.careers}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.blog}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.privacy}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.terms}</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.links.contact}</Link></li>
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
        ::selection { background-color: #6366f1; color: white; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
      
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <GradientOrbs />
        <GridPattern />
        <NoiseOverlay />
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