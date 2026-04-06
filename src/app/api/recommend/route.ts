import { NextRequest } from "next/server";
import { recommendClubs } from "@/lib/gemini";
import { apiError, apiSuccess } from "@/lib/utils";

// Demo clubs for recommendation (in production, query DB)
const demoClubs = [
  { name_kk: "Вокал студиясы", name_ru: "Вокальная студия", description_ru: "Профессиональные занятия вокалом", age_group: "7-18", direction: "vocal" },
  { name_kk: "Халық билері", name_ru: "Народные танцы", description_ru: "Казахские национальные танцы", age_group: "5-16", direction: "dance" },
  { name_kk: "Бейнелеу өнері", name_ru: "Изобразительное искусство", description_ru: "Рисунок, живопись, графика", age_group: "6-99", direction: "art" },
  { name_kk: "Театр студиясы", name_ru: "Театральная студия", description_ru: "Актёрское мастерство", age_group: "8-18", direction: "theater" },
  { name_kk: "Домбыра үйірмесі", name_ru: "Кружок домбры", description_ru: "Обучение игре на домбре", age_group: "7-99", direction: "music" },
  { name_kk: "Қолөнер студиясы", name_ru: "Студия рукоделия", description_ru: "Национальное рукоделие", age_group: "8-99", direction: "craft" },
  { name_kk: "Заманауи би", name_ru: "Современные танцы", description_ru: "Хип-хоп, контемпорари", age_group: "10-25", direction: "dance" },
  { name_kk: "Фортепиано", name_ru: "Фортепиано", description_ru: "Обучение игре на фортепиано", age_group: "6-18", direction: "music" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return apiError("Missing answers object");
    }

    const recommendation = await recommendClubs(answers, demoClubs);
    return apiSuccess({ recommendation });
  } catch (error) {
    console.error("Recommend error:", error);
    return apiError("Internal server error", 500);
  }
}
