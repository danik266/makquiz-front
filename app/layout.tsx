import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

// 1. ВАЖНО: Добавляем 'cyrillic', чтобы русский и казахский текст отображался красивым шрифтом Inter
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://makquiz.site"),
  title: {
    default: "Makquiz — AI Flashcards & Quizzes | Умные тесты", // Гибридный заголовок
    template: "%s | Makquiz",
  },
  // Описание ставим на английском как международном, но ключевые слова "вытянут" поиск на других языках
  description:
    "Turn study chaos into structured knowledge. Makquiz uses AI to instantly convert lectures and PDFs into smart flashcards. Превратите лекции и файлы в умные карточки с ИИ.",
  
  keywords: [
    // --- English ---
    "AI study tool",
    "flashcard generator",
    "spaced repetition",
    "exam prep",
    "PDF to quiz",
    // --- Russian ---
    "ИИ обучение",
    "генерация флеш-карточек",
    "интервальное повторение",
    "подготовка к экзаменам",
    "PDF в тест",
    "ЕНТ подготовка", // Актуально для КЗ
    // --- Kazakh ---
    "AI оқу құралы",
    "флеш-карталар жасау",
    "ҰБТ дайындық", // UNT prep
    "тест жасау",
    "смарт оқыту",
    "PDF тестке айналдыру",
  ],
  authors: [{ name: "Makquiz Team" }],
  creator: "Makquiz",
  publisher: "Makquiz",
  
  openGraph: {
    title: "Makquiz — Master Any Topic / Выучи любую тему",
    description: "Upload study materials and let AI create flashcards. Загрузи лекции или фото — ИИ создаст план обучения.",
    url: "https://makquiz.site",
    siteName: "Makquiz",
    // Указываем основной язык и альтернативные, чтобы соцсети понимали, что сайт мультиязычный
    locale: "en_US", 
    alternateLocale: ["ru_RU", "kk_KZ"], 
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Makquiz — Your AI Tutor / Твой ИИ репетитор",
    description: "Generate study materials instantly. Создавай тесты из файлов мгновенно.",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Оставляем 'en', так как это основной язык метаданных, 
    // но контент внутри будет меняться через LanguageProvider
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
             {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}