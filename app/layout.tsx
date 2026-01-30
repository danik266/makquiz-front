import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext"; // <-- 1. Импортируем

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Makquiz",
  description: "AI Flashcards Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Оборачиваем провайдеры друг в друга */}
        <AuthProvider>
          <LanguageProvider>
             {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}