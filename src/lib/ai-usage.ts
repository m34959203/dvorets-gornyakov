import { getOne, getMany, query } from "@/lib/db";
// `query` is used by logGeneration below; keep explicit import.

// ---------------------------------------------------------------------------
// Cost calculator (hardcoded price list — short switch).
// Prices are USD per 1M tokens, official Gemini pricing.
// ---------------------------------------------------------------------------
export function estimateCostUsd(
  model: string,
  promptTokens: number | null | undefined,
  completionTokens: number | null | undefined
): number {
  const inT = promptTokens ?? 0;
  const outT = completionTokens ?? 0;
  if (inT <= 0 && outT <= 0) return 0;

  let inPerM = 0;
  let outPerM = 0;
  switch (model) {
    case "gemini-2.0-flash":
    case "gemini-2.0-flash-001":
      inPerM = 0.1;
      outPerM = 0.4;
      break;
    case "gemini-2.0-flash-lite":
      inPerM = 0.075;
      outPerM = 0.3;
      break;
    case "gemini-2.5-flash":
      inPerM = 0.3;
      outPerM = 2.5;
      break;
    case "gemini-2.5-pro":
      inPerM = 1.25;
      outPerM = 10.0;
      break;
    default:
      // Unknown model — assume flash pricing as a safe fallback
      inPerM = 0.1;
      outPerM = 0.4;
  }

  const cost = (inT * inPerM) / 1_000_000 + (outT * outPerM) / 1_000_000;
  // Round to 6 decimals to fit NUMERIC(10,6)
  return Math.round(cost * 1_000_000) / 1_000_000;
}

// ---------------------------------------------------------------------------
// Log a generation. Never throws — safe to call in a finally block.
// ---------------------------------------------------------------------------
export interface LogGenerationInput {
  provider?: string;
  model: string;
  purpose: string;
  userId?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  durationMs: number;
  success: boolean;
  error?: string | null;
}

export async function logGeneration(input: LogGenerationInput): Promise<void> {
  try {
    const provider = input.provider ?? "gemini";
    const promptT =
      typeof input.promptTokens === "number" ? input.promptTokens : null;
    const completionT =
      typeof input.completionTokens === "number"
        ? input.completionTokens
        : null;
    let totalT: number | null =
      typeof input.totalTokens === "number" ? input.totalTokens : null;
    if (totalT === null && (promptT !== null || completionT !== null)) {
      totalT = (promptT ?? 0) + (completionT ?? 0);
    }

    const cost = estimateCostUsd(input.model, promptT, completionT);

    await query(
      `INSERT INTO ai_generations
        (provider, model, purpose, user_id, prompt_tokens, completion_tokens,
         total_tokens, cost_usd, duration_ms, success, error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        provider,
        input.model,
        input.purpose,
        input.userId ?? null,
        promptT,
        completionT,
        totalT,
        cost,
        Math.max(0, Math.floor(input.durationMs)),
        input.success,
        input.error ?? null,
      ]
    );
  } catch (err) {
    // Log-and-continue — never break the caller
    console.error("logGeneration failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Spend helpers
// ---------------------------------------------------------------------------
export async function getCurrentMonthSpend(): Promise<number> {
  try {
    const row = await getOne<{ sum: string | null }>(
      `SELECT COALESCE(SUM(cost_usd), 0)::text AS sum
         FROM ai_generations
        WHERE created_at >= date_trunc('month', NOW())`
    );
    const n = Number(row?.sum ?? 0);
    return Number.isFinite(n) ? n : 0;
  } catch (err) {
    console.error("getCurrentMonthSpend failed:", err);
    return 0;
  }
}

async function getMonthlyBudgetUsd(): Promise<number> {
  try {
    const row = await getOne<{ value: string }>(
      `SELECT value FROM site_settings WHERE key = $1`,
      ["ai_monthly_budget_usd"]
    );
    if (!row) return 0;
    const n = Number(row.value);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function withinBudget(): Promise<boolean> {
  const budget = await getMonthlyBudgetUsd();
  if (budget <= 0) return true; // 0 / unset → safe
  const spend = await getCurrentMonthSpend();
  return spend < budget;
}

// ---------------------------------------------------------------------------
// Additional aggregates used by the admin dashboard
// ---------------------------------------------------------------------------
export interface AiSummaryByPurpose {
  purpose: string;
  count: number;
  cost: number;
}
export interface AiSummaryByDay {
  date: string; // YYYY-MM-DD
  count: number;
  cost: number;
}
export interface AiSummary {
  total_requests: number;
  total_cost_usd: number;
  success_rate: number; // 0..1
  avg_duration_ms: number;
  by_purpose: AiSummaryByPurpose[];
  by_day: AiSummaryByDay[];
}

interface AggRow {
  total: string;
  total_cost: string | null;
  success_count: string;
  avg_duration: string | null;
}

export async function getSummary(filters: {
  purpose?: string;
  from?: string;
  to?: string;
}): Promise<AiSummary> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.purpose) {
    params.push(filters.purpose);
    where.push(`purpose = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    where.push(`created_at >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    where.push(`created_at <= $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const agg = await getOne<AggRow>(
    `SELECT
       COUNT(*)::text AS total,
       COALESCE(SUM(cost_usd), 0)::text AS total_cost,
       COALESCE(SUM(CASE WHEN success THEN 1 ELSE 0 END), 0)::text AS success_count,
       COALESCE(AVG(duration_ms), 0)::text AS avg_duration
       FROM ai_generations ${whereSql}`,
    params
  );

  const total = Number(agg?.total ?? 0);
  const totalCost = Number(agg?.total_cost ?? 0);
  const successCount = Number(agg?.success_count ?? 0);
  const avgDuration = Number(agg?.avg_duration ?? 0);

  const byPurposeRows = await getMany<{
    purpose: string;
    count: string;
    cost: string;
  }>(
    `SELECT purpose, COUNT(*)::text AS count, COALESCE(SUM(cost_usd),0)::text AS cost
       FROM ai_generations ${whereSql}
      GROUP BY purpose
      ORDER BY count DESC`,
    params
  );

  const byDayRows = await getMany<{ date: string; count: string; cost: string }>(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::text AS count,
            COALESCE(SUM(cost_usd),0)::text AS cost
       FROM ai_generations
       ${whereSql ? whereSql + " AND " : "WHERE "}
       created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 ASC`,
    params
  );

  return {
    total_requests: total,
    total_cost_usd: Number(totalCost.toFixed(6)),
    success_rate: total > 0 ? successCount / total : 1,
    avg_duration_ms: Math.round(avgDuration),
    by_purpose: byPurposeRows.map((r) => ({
      purpose: r.purpose,
      count: Number(r.count),
      cost: Number(r.cost),
    })),
    by_day: byDayRows.map((r) => ({
      date: r.date,
      count: Number(r.count),
      cost: Number(r.cost),
    })),
  };
}
