import { NextRequest } from "next/server";
import { recommendClubs } from "@/lib/gemini";
import { query } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";

interface ClubRow {
  id: string;
  name_kk: string;
  name_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  age_group: string;
  direction: string;
}

interface Match {
  id: string;
  name_kk: string;
  name_ru: string;
}

function findMatches(text: string, clubs: ClubRow[]): Match[] {
  const low = text.toLowerCase();
  const seen = new Set<string>();
  const matches: Match[] = [];
  for (const c of clubs) {
    const hit =
      (c.name_ru && low.includes(c.name_ru.toLowerCase())) ||
      (c.name_kk && low.includes(c.name_kk.toLowerCase()));
    if (hit && !seen.has(c.id)) {
      seen.add(c.id);
      matches.push({ id: c.id, name_kk: c.name_kk, name_ru: c.name_ru });
    }
    if (matches.length >= 3) break;
  }
  return matches;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return apiError("Missing answers object");
    }

    const result = await query<ClubRow>(
      `SELECT id, name_kk, name_ru, description_kk, description_ru, age_group, direction
         FROM clubs WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 40`
    );
    const clubs = result.rows;

    if (clubs.length === 0) {
      return apiSuccess({
        recommendation:
          "В базе пока нет активных кружков. Загляните в раздел «Кружки», когда будут добавлены.",
        matches: [],
      });
    }

    const geminiInput = clubs.map((c) => ({
      name_kk: c.name_kk,
      name_ru: c.name_ru,
      description_ru: c.description_ru || "",
      age_group: c.age_group,
      direction: c.direction,
    }));

    const recommendation = await recommendClubs(answers, geminiInput);
    const matches = findMatches(recommendation, clubs);

    return apiSuccess({ recommendation, matches });
  } catch (error) {
    console.error("Recommend error:", error);
    return apiError("Internal server error", 500);
  }
}
