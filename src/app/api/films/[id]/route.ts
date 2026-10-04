import { NextRequest } from "next/server";
import { query, getFilm, rateLimit } from "@/lib/db";
import { browser, respond, sameOrigin } from "@/lib/http";
import { parseId } from "@/lib/site";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const id = parseId((await context.params).id);
  const film = await getFilm(id);
  if (!film)
    return respond({ error: "フィルムが見つかりません。" }, undefined, 404);
  const client = browser(request);
  const liked = Boolean(
    (
      await query("SELECT 1 FROM film_likes WHERE film_id=$1 AND browser=$2", [
        id,
        client,
      ])
    ).rowCount,
  );
  const reported = Boolean(
    (
      await query(
        "SELECT 1 FROM film_reports WHERE film_id=$1 AND browser=$2",
        [id, client],
      )
    ).rowCount,
  );
  return respond({ likes: film.likes, liked, reported }, client);
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return respond({ error: "不正なリクエストです。" }, undefined, 403);
  const id = parseId((await context.params).id);
  if (!(await getFilm(id)))
    return respond({ error: "フィルムが見つかりません。" }, undefined, 404);
  const client = browser(request);
  if (!(await rateLimit(`action:${client}`, 60, 60)))
    return respond({ error: "少し待ってからお試しください。" }, client, 429);
  try {
    const data = await request.json();
    if (data.action === "like") {
      await query(
        "INSERT INTO film_likes(film_id,browser) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [id, client],
      );
      return respond(
        { likes: (await getFilm(id))!.likes, liked: true },
        client,
      );
    }
    if (
      data.action === "report" &&
      [
        "権利侵害の疑い",
        "作品と無関係",
        "不適切な画像・内容",
        "個人情報が含まれる",
        "その他",
      ].includes(data.reason)
    ) {
      await query(
        "INSERT INTO film_reports(film_id,browser,reason) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [id, client, data.reason],
      );
      return respond({ reported: true }, client);
    }
    return respond({ error: "操作内容を確認してください。" }, client, 400);
  } catch {
    return respond(
      { error: "リクエストを処理できませんでした。" },
      client,
      400,
    );
  }
}
