import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === new URL(process.env.SITE_URL || request.url).origin;
}
function signature(id: string) {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("COOKIE_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(id).digest("hex");
}
export function browser(request: NextRequest) {
  const cookie = request.cookies.get("film_browser")?.value || "";
  const [id, sig] = cookie.split(".");
  if (/^[a-f0-9-]{36}$/.test(id || "") && sig === signature(id)) return id;
  return randomUUID();
}
export function respond(data: unknown, id?: string, status = 200) {
  const response = NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
  if (id)
    response.cookies.set("film_browser", `${id}.${signature(id)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.SITE_URL?.startsWith("https://") ?? false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5,
    });
  return response;
}
