import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { respond, sameOrigin } from "@/lib/http";
export async function POST(request: NextRequest) {
  if (!isAdmin(request.headers.get("authorization")))
    return respond({ error: "認証が必要です。" }, undefined, 401);
  if (!sameOrigin(request))
    return respond({ error: "不正なリクエストです。" }, undefined, 403);
  try {
    const { id, visible, action } = await request.json();
    if (!Number.isSafeInteger(id) || id < 1)
      return respond({ error: "IDが不正です。" }, undefined, 400);
    if (action === "visibility" && typeof visible === "boolean")
      await query("UPDATE film_posts SET visible=$1 WHERE id=$2", [
        visible,
        id,
      ]);
    else if (action === "resolve")
      await query("UPDATE film_reports SET resolved=true WHERE film_id=$1", [
        id,
      ]);
    else return respond({ error: "操作が不正です。" }, undefined, 400);
    return respond({ ok: true });
  } catch {
    return respond({ error: "更新できませんでした。" }, undefined, 400);
  }
}
