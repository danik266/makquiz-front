"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import clsx from "clsx";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answers: number[];
  explanation?: string;
  image_query?: string;
  image_url?: string;
}

interface QuizQuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onChange: (updated: QuizQuestion) => void;
  onDelete: () => void;
}

export default function QuizQuestionEditor({
  question,
  index,
  onChange,
  onDelete,
}: QuizQuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateQuestion = (updates: Partial<QuizQuestion>) => {
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...localQuestion.options];
    newOptions[optionIndex] = value;
    updateQuestion({ options: newOptions });
  };

  const addOption = () => {
    if (localQuestion.options.length < 6) {
      updateQuestion({ options: [...localQuestion.options, ""] });
    }
  };

  const removeOption = (optionIndex: number) => {
    if (localQuestion.options.length > 2) {
      const newOptions = localQuestion.options.filter((_, i) => i !== optionIndex);
      const newCorrectAnswers = localQuestion.correct_answers
        .filter((idx) => idx !== optionIndex)
        .map((idx) => (idx > optionIndex ? idx - 1 : idx));
      updateQuestion({
        options: newOptions,
        correct_answers: newCorrectAnswers
      });
    }
  };

  const toggleCorrectAnswer = (optionIndex: number) => {
    const currentCorrect = localQuestion.correct_answers || [];
    const isCurrentlyCorrect = currentCorrect.includes(optionIndex);

    let newCorrectAnswers: number[];
    if (isCurrentlyCorrect) {
      // Remove from correct answers (but keep at least one correct answer)
      newCorrectAnswers = currentCorrect.filter((idx) => idx !== optionIndex);
      if (newCorrectAnswers.length === 0) {
        alert("Должен быть хотя бы один правильный ответ!");
        return;
      }
    } else {
      // Add to correct answers
      newCorrectAnswers = [...currentCorrect, optionIndex].sort();
    }

    updateQuestion({ correct_answers: newCorrectAnswers });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-indigo-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Вопрос #{index + 1}
        </span>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Удалить вопрос"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Вопрос
        </label>
        <textarea
          value={localQuestion.question}
          onChange={(e) => updateQuestion({ question: e.target.value })}
          placeholder="Введите вопрос..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none text-slate-900"
          rows={2}
        />
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Варианты ответов (отметьте правильные)
        </label>
        <div className="space-y-2">
          {localQuestion.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              {/* Checkbox for correct answer */}
              <button
                onClick={() => toggleCorrectAnswer(optionIndex)}
                className={clsx(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  localQuestion.correct_answers?.includes(optionIndex)
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-slate-300 hover:border-green-400"
                )}
                title="Отметить как правильный ответ"
              >
                {localQuestion.correct_answers?.includes(optionIndex) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Option text */}
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
                placeholder={`Вариант ${optionIndex + 1}`}
                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-900"
              />

              {/* Remove option button */}
              {localQuestion.options.length > 2 && (
                <button
                  onClick={() => removeOption(optionIndex)}
                  className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Удалить вариант"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add option button */}
        {localQuestion.options.length < 6 && (
          <button
            onClick={addOption}
            className="mt-3 w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Добавить вариант</span>
          </button>
        )}
      </div>

      {/* Explanation (Optional) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Объяснение (необязательно)
        </label>
        <textarea
          value={localQuestion.explanation || ""}
          onChange={(e) => updateQuestion({ explanation: e.target.value })}
          placeholder="Объясните почему это правильный ответ..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none text-slate-900"
          rows={2}
        />
      </div>

      {/* Image Query (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Поисковый запрос для изображения (необязательно)
        </label>
        <input
          type="text"
          value={localQuestion.image_query || ""}
          onChange={(e) => updateQuestion({ image_query: e.target.value })}
          placeholder="например: python programming"
          className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-slate-900"
        />
      </div>

      {/* Correct Answers Summary */}
      {localQuestion.correct_answers && localQuestion.correct_answers.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Правильные ответы:{" "}
            {localQuestion.correct_answers
              .map((idx) => localQuestion.options[idx])
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
