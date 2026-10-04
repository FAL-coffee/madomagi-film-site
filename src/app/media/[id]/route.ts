import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseId } from "@/lib/site";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const id = parseId((await context.params).id);
  const row = (
    await query<{ image: Buffer; visible: boolean }>(
      "SELECT image,visible FROM film_posts WHERE id=$1",
      [id],
    )
  ).rows[0];
  if (!row || (!row.visible && !isAdmin(request.headers.get("authorization"))))
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  return new NextResponse(new Uint8Array(row.image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
