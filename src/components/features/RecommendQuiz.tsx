"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n";

interface RecommendQuizProps {
  locale: Locale;
  messages: Record<string, string>;
}

interface Question {
  id: string;
  text_kk: string;
  text_ru: string;
  options: { value: string; label_kk: string; label_ru: string }[];
}

const questions: Question[] = [
  {
    id: "age",
    text_kk: "Баланың жасы қандай?",
    text_ru: "Какой возраст ребёнка?",
    options: [
      { value: "3-6", label_kk: "3-6 жас", label_ru: "3-6 лет" },
      { value: "7-10", label_kk: "7-10 жас", label_ru: "7-10 лет" },
      { value: "11-14", label_kk: "11-14 жас", label_ru: "11-14 лет" },
      { value: "15-18", label_kk: "15-18 жас", label_ru: "15-18 лет" },
      { value: "18+", label_kk: "18+ жас", label_ru: "18+ лет" },
    ],
  },
  {
    id: "interest",
    text_kk: "Қандай бағыт қызықтырады?",
    text_ru: "Какое направление интересует?",
    options: [
      { value: "music", label_kk: "Музыка мен ән", label_ru: "Музыка и пение" },
      { value: "dance", label_kk: "Би", label_ru: "Танцы" },
      { value: "art", label_kk: "Бейнелеу өнері", label_ru: "Изобразительное искусство" },
      { value: "theater", label_kk: "Театр", label_ru: "Театр" },
      { value: "craft", label_kk: "Қолөнер", label_ru: "Рукоделие" },
      { value: "sport", label_kk: "Спорт", label_ru: "Спорт" },
    ],
  },
  {
    id: "schedule",
    text_kk: "Қай уақыт ыңғайлы?",
    text_ru: "Какое время удобно?",
    options: [
      { value: "morning", label_kk: "Таңертең (9-12)", label_ru: "Утро (9-12)" },
      { value: "afternoon", label_kk: "Түстен кейін (14-17)", label_ru: "День (14-17)" },
      { value: "evening", label_kk: "Кеш (17-20)", label_ru: "Вечер (17-20)" },
      { value: "any", label_kk: "Кез келген", label_ru: "Любое" },
    ],
  },
  {
    id: "experience",
    text_kk: "Тәжірибесі бар ма?",
    text_ru: "Есть ли опыт?",
    options: [
      { value: "none", label_kk: "Жоқ, жаңадан бастаймын", label_ru: "Нет, начинаю с нуля" },
      { value: "some", label_kk: "Аздаған тәжірибе бар", label_ru: "Немного есть" },
      { value: "experienced", label_kk: "Тәжірибелі", label_ru: "Опытный" },
    ],
  },
  {
    id: "goal",
    text_kk: "Мақсатыңыз қандай?",
    text_ru: "Какова ваша цель?",
    options: [
      { value: "hobby", label_kk: "Хобби ретінде", label_ru: "Как хобби" },
      { value: "professional", label_kk: "Кәсіби даму", label_ru: "Профессиональное развитие" },
      { value: "social", label_kk: "Жаңа достар табу", label_ru: "Найти новых друзей" },
      { value: "health", label_kk: "Денсаулық үшін", label_ru: "Для здоровья" },
    ],
  },
];

export default function RecommendQuiz({ locale, messages: t }: RecommendQuizProps) {
  const [step, setStep] = useState(-1); // -1 = not started
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = step >= 0 ? questions[step] : null;

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, locale }),
      });
      const data = await response.json();
      setResult(data.data?.recommendation || data.error || "Error");
    } catch {
      setResult(locale === "kk" ? "Қате орын алды" : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(-1);
    setAnswers({});
    setResult(null);
  };

  // Not started
  if (step === -1) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.quizTitle}</h3>
        <p className="text-gray-600 mb-6">
          {locale === "kk"
            ? "5 сұраққа жауап беріп, өзіңізге сәйкес үйірмені табыңыз"
            : "Ответьте на 5 вопросов и найдите подходящий кружок"}
        </p>
        <Button onClick={() => setStep(0)} size="lg">
          {t.quizStart}
        </Button>
      </div>
    );
  }

  // Loading result
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">
          {locale === "kk" ? "AI сіз үшін үйірме іздеуде..." : "AI подбирает кружок для вас..."}
        </p>
      </div>
    );
  }

  // Show result
  if (result) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.quizResult}</h3>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6">
          {result}
        </div>
        <Button onClick={reset} variant="outline">
          {locale === "kk" ? "Қайтадан бастау" : "Начать заново"}
        </Button>
      </div>
    );
  }

  // Show question
  if (!currentQuestion) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {t.quizQuestion} {step + 1} / {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {locale === "kk" ? currentQuestion.text_kk : currentQuestion.text_ru}
      </h3>

      <div className="space-y-2">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            {locale === "kk" ? option.label_kk : option.label_ru}
          </button>
        ))}
      </div>
    </div>
  );
}
