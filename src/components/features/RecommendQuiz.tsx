"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import DgIcon from "@/components/layout/DgIcon";

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

interface Match {
  id: string;
  name_kk: string;
  name_ru: string;
}

export default function RecommendQuiz({ locale, messages: t }: RecommendQuizProps) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const [step, setStep] = useState(-1); // -1 = not started
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
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
      setMatches(Array.isArray(data.data?.matches) ? data.data.matches : []);
    } catch {
      setResult(T("Қате орын алды", "Произошла ошибка"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(-1);
    setAnswers({});
    setResult(null);
    setMatches([]);
  };

  // Не начат
  if (step === -1) {
    return (
      <div className="quiz">
        <div className="quiz-eyebrow">{T("AI-көмекші", "AI-помощник")}</div>
        <h3>{t.quizTitle}</h3>
        <p className="quiz-sub">
          {T(
            "5 сұраққа жауап беріп, өзіңізге сәйкес үйірмені табыңыз.",
            "Ответьте на 5 вопросов и найдите подходящий кружок."
          )}
        </p>
        <button className="dg-btn" onClick={() => setStep(0)}>
          {t.quizStart} <DgIcon name="arrow" size={12} />
        </button>
      </div>
    );
  }

  // Загрузка
  if (loading) {
    return (
      <div className="quiz">
        <div className="quiz-loading">
          <div className="quiz-spinner" />
          <p>{T("AI сіз үшін үйірме іздеуде…", "AI подбирает кружок для вас…")}</p>
        </div>
      </div>
    );
  }

  // Результат
  if (result) {
    return (
      <div className="quiz">
        <div className="quiz-eyebrow">{t.quizResult}</div>
        <p className="quiz-result">{result}</p>

        <div className="quiz-matches">
          {matches.length > 0 ? (
            matches.map((m) => (
              <div key={m.id} className="quiz-match">
                <span className="nm">{T(m.name_kk, m.name_ru)}</span>
                <Link href={`/${locale}/clubs/${m.id}`}>{T("Жазылу", "Записаться")}</Link>
              </div>
            ))
          ) : (
            <div className="quiz-match">
              <span className="nm">{T("Барлық үйірмелерді қараңыз", "Посмотрите все кружки")}</span>
              <Link href={`/${locale}/clubs`}>{T("Көру", "Смотреть")}</Link>
            </div>
          )}
        </div>

        <button className="dg-btn dg-btn-ghost" onClick={reset}>
          {T("Қайтадан бастау", "Начать заново")}
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // Вопрос
  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="quiz-step">
          {t.quizQuestion} {step + 1} / {questions.length}
        </span>
        <div className="quiz-bars">
          {questions.map((_, i) => (
            <div key={i} className={"quiz-bar" + (i <= step ? " on" : "")} />
          ))}
        </div>
      </div>

      <h3 className="quiz-q">{T(currentQuestion.text_kk, currentQuestion.text_ru)}</h3>

      <div className="quiz-opts">
        {currentQuestion.options.map((option) => (
          <button key={option.value} className="quiz-opt" onClick={() => handleAnswer(option.value)}>
            {T(option.label_kk, option.label_ru)}
          </button>
        ))}
      </div>
    </div>
  );
}
