export const siteName =
  "魔法少女まどか☆マギカ ワルプルギスの廻天 | 最高のフィルムを決めよう";
export const siteUrl = process.env.SITE_URL || "http://localhost:3000";
export const description =
  "魔法少女まどか☆マギカ〈ワルプルギスの廻天〉のフィルムを集める非公式ファンギャラリー。お気に入りの一枚を投稿して、いいねで応援しよう。";
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}
export function parseId(value: string) {
  return /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) <= 2147483647
    ? Number(value)
    : 0;
}
