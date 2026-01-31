"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft, TrendingUp, Clock, Target, Calendar,
  Award, BarChart3, CheckCircle, Loader2, Filter,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimeFilter = "today" | "week" | "month" | "all";

export default function HistoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useLanguage();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [selectedDeck, setSelectedDeck] = useState<string>("all");
  const [showDeckFilter, setShowDeckFilter] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    loadData();
  }, [token]);
 const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/\d{2}:\d{2}:\d{2}-/.test(dateStr)) {
      return new Date(dateStr + 'Z');
    }
    return new Date(dateStr);
  };
  const loadData = async () => {
    try {
      const sessionsRes = await fetch(
        "https://makquiz-back.onrender.com/api/decks/stats/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Response status:", sessionsRes.status);
      
      const sessionsData = await sessionsRes.json();
      console.log("Raw API response:", sessionsData);
      console.log("Is array?", Array.isArray(sessionsData));
      console.log("Response length:", sessionsData?.length);
      
      if (sessionsData && sessionsData.length > 0) {
        console.log("First session example:", sessionsData[0]);
      }
      
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (e) {
      console.error("Error loading data:", e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique deck names
  const deckNames = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    const names = Array.from(new Set(sessions.map(s => s.deck_name).filter(Boolean)));
    return names.sort();
  }, [sessions]);

  // Filter sessions based on selected filters
  const filteredSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    let filtered = [...sessions];
    
    console.log("Before filtering - total sessions:", sessions.length);
    console.log("Time filter:", timeFilter);
    console.log("Deck filter:", selectedDeck);

    // Time filter
    const now = new Date();
    if (timeFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      console.log("Today date:", today);
      filtered = filtered.filter(s => {
        const sessionDate = parseDate(s.completed_at);
        console.log("Session date:", sessionDate, ">=", today, "?", sessionDate >= today);
        return sessionDate >= today;
      });
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => parseDate(s.completed_at) >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => parseDate(s.completed_at) >= monthAgo);
    }

    console.log("After time filter:", filtered.length);

    // Deck filter
    if (selectedDeck !== "all") {
      filtered = filtered.filter(s => s.deck_name === selectedDeck);
      console.log("After deck filter:", filtered.length);
    }

    console.log("Final filtered sessions:", filtered.length);
    return filtered;
  }, [sessions, timeFilter, selectedDeck]);

  // Calculate statistics from filtered sessions
  const stats = useMemo(() => {
    console.log("Calculating stats from sessions:", filteredSessions.length);
    const calculated = {
      total_sessions: filteredSessions.length,
      total_cards: filteredSessions.reduce((sum, s) => sum + (s.total_cards || 0), 0),
      new_cards: filteredSessions.reduce((sum, s) => sum + (s.new_cards_learned || 0), 0),
      correct: filteredSessions.reduce((sum, s) => sum + (s.correct || 0), 0),
      incorrect: filteredSessions.reduce((sum, s) => sum + (s.incorrect || 0), 0),
      total_time: filteredSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      avg_accuracy: filteredSessions.length > 0
        ? filteredSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / filteredSessions.length
        : 0
    };
    console.log("Calculated stats:", calculated);
    return calculated;
  }, [filteredSessions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const grouped: { [key: string]: { total: number; correct: number } } = {};
    
    console.log("Creating chart from", filteredSessions.length, "sessions");
    
    filteredSessions.forEach(session => {
      const date = new Date(session.completed_at.endsWith('Z') ? session.completed_at : session.completed_at + 'Z')
      let key: string;
      
      if (timeFilter === "today") {
        key = date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
      } else if (timeFilter === "week") {
        key = date.toLocaleDateString("ru", { weekday: "short" });
      } else {
        key = date.toLocaleDateString("ru", { day: "numeric", month: "short" });
      }
      
      console.log("Session time:", session.completed_at, "-> key:", key);
      
      if (!grouped[key]) {
        grouped[key] = { total: 0, correct: 0 };
      }
      grouped[key].total += session.total_cards || 0;
      grouped[key].correct += session.correct || 0;
    });

    console.log("Grouped data:", grouped);
    
    const result = Object.entries(grouped).map(([label, data]) => ({
      label,
      ...data
    })).slice(-7); // Last 7 data points
    
    console.log("Final chart data:", result);
    return result;
  }, [filteredSessions, timeFilter]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionKey = (session: any, index: number): string => {
    if (session._id && typeof session._id === 'object' && session._id.$oid) {
      return session._id.$oid;
    }
    if (session._id && typeof session._id === 'string') {
      return session._id;
    }
    if (session.id && typeof session.id === 'string') {
      return session.id;
    }
    return `${session.deck_name}-${session.completed_at}-${index}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
    <div className="flex items-center gap-4">
      {/* Стрелка назад только на десктопе */}
      <button
        onClick={() => router.push("/dashboard")}
        className="hidden md:flex p-2 hover:bg-slate-100 rounded-full transition"
      >
        <ArrowLeft className="w-6 h-6 text-slate-600" />
      </button>
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.history.title}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {t.history.subtitle}
        </p>
      </div>
    </div>
  </div>
</header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {/* Time Filter */}
          <div className="flex gap-2">
            {[
              { value: "today", label: t.history.today },
              { value: "week", label: t.history.week },
              { value: "month", label: t.history.month },
              { value: "all", label: t.history.allTime }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value as TimeFilter)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  timeFilter === filter.value
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Deck Filter */}
          {deckNames.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowDeckFilter(!showDeckFilter)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  selectedDeck !== "all"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                {selectedDeck === "all" ? t.history.allDecks : selectedDeck}
                <ChevronDown className={`w-4 h-4 transition-transform ${showDeckFilter ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showDeckFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[200px] max-h-[300px] overflow-y-auto z-10"
                  >
                    <button
                      onClick={() => {
                        setSelectedDeck("all");
                        setShowDeckFilter(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                        selectedDeck === "all"
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t.history.allDecks}
                    </button>
                    {deckNames.map((deck) => (
                      <button
                        key={deck}
                        onClick={() => {
                          setSelectedDeck(deck);
                          setShowDeckFilter(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                          selectedDeck === deck
                            ? "bg-orange-50 text-orange-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {deck}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            {t.history.overallStats}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg shadow-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-black mb-1">
                {stats.total_sessions}
              </p>
              <p className="text-xs font-bold opacity-80 uppercase">
                {t.history.sessions}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {stats.total_cards}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {t.history.cards}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">
                {stats.correct}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {t.history.memorized}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {Math.round(stats.avg_accuracy)}%
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {t.history.accuracy}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {formatDuration(stats.total_time)}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {t.history.time}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              {t.history.activity}
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-600">
                    {Math.round(stats.avg_accuracy)}%
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {t.history.avgAccuracy}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">
                    {stats.total_cards}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {t.history.totalCards}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">
                    {stats.correct}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {t.history.memorized}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-3">
                {chartData.map((data, idx) => {
                  const successRate = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                  
                  return (
                    <div key={`${data.label}-${idx}`} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700">{data.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {data.correct}/{data.total}
                          </span>
                          <span className={`text-sm font-black ${
                            successRate >= 80 ? "text-green-600" :
                            successRate >= 60 ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {Math.round(successRate)}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-10 bg-slate-50 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${successRate}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                          className={`h-full rounded-lg ${
                            successRate >= 80 ? "bg-gradient-to-r from-green-500 to-green-600" :
                            successRate >= 60 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                            "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-bold text-slate-700 mix-blend-difference">
                            {data.total} карточек
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sessions History */}
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            {t.history.sessionHistory}
            <span className="text-sm font-medium text-slate-400">
              ({filteredSessions.length})
            </span>
          </h2>

          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {t.live.noSessionsForFilter}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={getSessionKey(session, index)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 text-lg mb-1">
                        {session.deck_name || t.history.noTitle}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {parseDate(session.completed_at).toLocaleString("ru", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-black ${
                          (session.accuracy || 0) >= 80
                            ? "text-green-600"
                            : (session.accuracy || 0) >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(session.accuracy || 0)}%
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {t.history.accuracy}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">
                        {session.total_cards || 0}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {t.history.cards}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">
                        {session.correct || 0}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {t.history.memorized}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-amber-600">
                        {session.incorrect || 0}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Повторить
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">
                        {formatDuration(session.duration_seconds || 0)}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {t.history.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}