import { createHash, timingSafeEqual } from "node:crypto";
export function adminConfigured() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}
export function isAdmin(auth: string | null) {
  if (!adminConfigured() || !auth?.startsWith("Basic ")) return false;
  const supplied = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const expected = `${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`;
  return timingSafeEqual(
    createHash("sha256").update(supplied).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
