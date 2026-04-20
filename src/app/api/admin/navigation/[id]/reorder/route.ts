import { NextRequest } from "next/server";
import { getOne, getMany, query } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { navItemReorderSchema, parseBody } from "@/lib/validators";
import type { NavItemRow } from "@/lib/nav";

/**
 * POST /api/admin/navigation/[id]/reorder  { direction: "up" | "down" }
 *
 * Moves the item up/down within the same parent_id group.
 * Strategy: swap sort_order with the nearest sibling in the desired direction.
 * If no neighbour, nudge the item by +/-10 so the change still persists.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!requireRole(user, ["admin", "editor"])) return apiError("Unauthorized", 401);
    const { id } = await params;

    const body = await req.json();
    const parsed = parseBody(navItemReorderSchema, body);
    if ("error" in parsed) return apiError(parsed.error);
    const { direction } = parsed.data;

    const current = await getOne<NavItemRow>(
      `SELECT id, parent_id, sort_order FROM nav_items WHERE id = $1`,
      [id]
    );
    if (!current) return apiError("Not found", 404);

    const parentWhere = current.parent_id === null ? "parent_id IS NULL" : "parent_id = $2";
    const parentParam = current.parent_id === null ? [] : [current.parent_id];

    let neighbour: NavItemRow | null = null;
    if (direction === "up") {
      const rows = await getMany<NavItemRow>(
        `SELECT id, sort_order FROM nav_items
          WHERE ${parentWhere}
            AND (sort_order < $1 OR (sort_order = $1 AND id <> $${parentParam.length + 2}))
          ORDER BY sort_order DESC, created_at DESC
          LIMIT 1`,
        [current.sort_order, ...parentParam, id]
      );
      neighbour = rows[0] ?? null;
    } else {
      const rows = await getMany<NavItemRow>(
        `SELECT id, sort_order FROM nav_items
          WHERE ${parentWhere}
            AND (sort_order > $1 OR (sort_order = $1 AND id <> $${parentParam.length + 2}))
          ORDER BY sort_order ASC, created_at ASC
          LIMIT 1`,
        [current.sort_order, ...parentParam, id]
      );
      neighbour = rows[0] ?? null;
    }

    if (neighbour) {
      // Swap sort_order values
      await query(
        `UPDATE nav_items SET sort_order = $1 WHERE id = $2`,
        [neighbour.sort_order, current.id]
      );
      await query(
        `UPDATE nav_items SET sort_order = $1 WHERE id = $2`,
        [current.sort_order, neighbour.id]
      );
    } else {
      // Lone at the edge — nudge by ±10 so state is at least recorded
      const delta = direction === "up" ? -10 : 10;
      await query(
        `UPDATE nav_items SET sort_order = GREATEST(0, sort_order + $1) WHERE id = $2`,
        [delta, current.id]
      );
    }

    return apiSuccess({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/navigation/[id]/reorder error:", e);
    return apiError("Internal server error", 500);
  }
}
