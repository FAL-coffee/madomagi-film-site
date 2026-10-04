import { NextRequest } from "next/server";
import sharp from "sharp";
import { query, rateLimit } from "@/lib/db";
import { browser, respond, sameOrigin } from "@/lib/http";
export const runtime = "nodejs";
const MAX = 10 * 1024 * 1024;
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return respond({ error: "不正なリクエストです。" }, undefined, 403);
  if (Number(request.headers.get("content-length")) > MAX + 65536)
    return respond(
      { error: "画像は10MB以下で選んでください。" },
      undefined,
      413,
    );
  const id = browser(request);
  if (!(await rateLimit(`upload:${id}`, 10, 3600)))
    return respond(
      { error: "投稿が続いています。しばらく待ってからお試しください。" },
      id,
      429,
    );
  try {
    const data = await request.formData();
    const file = data.get("image");
    const title = String(data.get("title") || "").trim();
    const caption = String(data.get("caption") || "").trim();
    const name = String(data.get("name") || "").trim() || "匿名の魔法少女";
    if (
      !title ||
      title.length > 80 ||
      caption.length > 1000 ||
      name.length > 40 ||
      data.get("consent") !== "on"
    )
      return respond(
        { error: "入力内容と投稿への同意を確認してください。" },
        id,
        400,
      );
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return respond(
        { error: "JPEG・PNG・WebPの画像（10MB以下）を選んでください。" },
        id,
        400,
      );
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input, {
      limitInputPixels: 40_000_000,
    }).metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages || 1) > 1
    )
      return respond(
        { error: "静止画像のJPEG・PNG・WebPを選んでください。" },
        id,
        400,
      );
    // Re-encode uploads to validate image content and strip EXIF/location metadata.
    const { data: image, info } = await sharp(input, {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
    const result = await query<{ id: number }>(
      "INSERT INTO film_posts(title,caption,name,width,height,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
      [title, caption, name, info.width, info.height, image],
    );
    return respond({ id: result.rows[0].id }, id, 201);
  } catch {
    return respond(
      {
        error:
          "画像を読み込めませんでした。ファイルを確認して再度お試しください。",
      },
      id,
      400,
    );
  }
}
