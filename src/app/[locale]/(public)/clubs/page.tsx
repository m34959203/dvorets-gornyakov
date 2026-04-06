"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { isValidLocale, type Locale, getMessages } from "@/lib/i18n";
import ClubCard from "@/components/features/ClubCard";
import RecommendQuiz from "@/components/features/RecommendQuiz";

const demoClubs = [
  { id: "1", name_kk: "Вокал студиясы", name_ru: "Вокальная студия", description_kk: "Кәсіби вокал сабақтары балалар мен ересектерге", description_ru: "Профессиональные занятия вокалом для детей и взрослых", image_url: null, age_group: "7-18", direction: "vocal", instructor_name: "Айгуль Сериковна" },
  { id: "2", name_kk: "Халық билері", name_ru: "Народные танцы", description_kk: "Қазақтың ұлттық билерін үйрену", description_ru: "Изучение казахских национальных танцев", image_url: null, age_group: "5-16", direction: "dance", instructor_name: "Динара Маратовна" },
  { id: "3", name_kk: "Бейнелеу өнері студиясы", name_ru: "Студия изобразительного искусства", description_kk: "Сурет салу, кескіндеме, графика", description_ru: "Рисунок, живопись, графика", image_url: null, age_group: "6-99", direction: "art", instructor_name: "Бауыржан Нурланович" },
  { id: "4", name_kk: "Театр студиясы", name_ru: "Театральная студия", description_kk: "Актёрлік шеберлік, сценалық сөйлеу", description_ru: "Актёрское мастерство, сценическая речь", image_url: null, age_group: "8-18", direction: "theater", instructor_name: "Сауле Бекеновна" },
  { id: "5", name_kk: "Домбыра үйірмесі", name_ru: "Кружок домбры", description_kk: "Домбыра ойнауды үйрену", description_ru: "Обучение игре на домбре", image_url: null, age_group: "7-99", direction: "music", instructor_name: "Ерлан Маратович" },
  { id: "6", name_kk: "Қолөнер студиясы", name_ru: "Студия рукоделия", description_kk: "Ұлттық қолөнер: кесте, ою-өрнек", description_ru: "Национальное рукоделие: вышивка, орнамент", image_url: null, age_group: "8-99", direction: "craft", instructor_name: "Гульмира Кайратовна" },
  { id: "7", name_kk: "Заманауи би", name_ru: "Современные танцы", description_kk: "Хип-хоп, контемпорари, джаз-фанк", description_ru: "Хип-хоп, контемпорари, джаз-фанк", image_url: null, age_group: "10-25", direction: "dance", instructor_name: "Асхат Бекович" },
  { id: "8", name_kk: "Фортепиано", name_ru: "Фортепиано", description_kk: "Фортепиано ойнауды үйрету", description_ru: "Обучение игре на фортепиано", image_url: null, age_group: "6-18", direction: "music", instructor_name: "Наталья Ивановна" },
];

const directions = [
  { value: "all", label_kk: "Барлық бағыттар", label_ru: "Все направления" },
  { value: "vocal", label_kk: "Вокал", label_ru: "Вокал" },
  { value: "dance", label_kk: "Би", label_ru: "Танцы" },
  { value: "art", label_kk: "Сурет", label_ru: "Рисование" },
  { value: "theater", label_kk: "Театр", label_ru: "Театр" },
  { value: "music", label_kk: "Музыка", label_ru: "Музыка" },
  { value: "craft", label_kk: "Қолөнер", label_ru: "Рукоделие" },
];

export default function ClubsPage() {
  const params = useParams();
  const localeParam = params.locale as string;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const messages = getMessages(locale);
  const t = messages.clubs;

  const [directionFilter, setDirectionFilter] = useState("all");

  const filteredClubs = directionFilter === "all"
    ? demoClubs
    : demoClubs.filter((c) => c.direction === directionFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

      {/* AI Recommendation Quiz */}
      <div className="mb-8">
        <RecommendQuiz locale={locale} messages={t} />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {directions.map((dir) => (
          <button
            key={dir.value}
            onClick={() => setDirectionFilter(dir.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              directionFilter === dir.value
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
            }`}
          >
            {locale === "kk" ? dir.label_kk : dir.label_ru}
          </button>
        ))}
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClubs.map((club) => (
          <ClubCard key={club.id} club={club} locale={locale} />
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <p className="text-center text-gray-500 py-12">{t.noClubs}</p>
      )}
    </div>
  );
}
