import { NextRequest } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/utils";
import { runPendingJobs } from "@/lib/scheduler";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const r = await query(
      `DELETE FROM scheduled_jobs WHERE id = $1 AND status IN ('pending','failed') RETURNING id`,
      [id]
    );
    if (r.rowCount === 0) return apiError("Cannot delete running/done job or not found", 400);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;
    const r = await query(
      `UPDATE scheduled_jobs
          SET status = 'pending', run_at = NOW(), attempts = 0, last_error = NULL, started_at = NULL, completed_at = NULL
        WHERE id = $1 AND status IN ('failed','done')
        RETURNING id`,
      [id]
    );
    if (r.rowCount === 0) return apiError("Cannot requeue this job", 400);
    runPendingJobs().catch(console.error);
    return apiSuccess({ ok: true });
  } catch (e) {
    console.error(e);
    return apiError("Internal server error", 500);
  }
}
