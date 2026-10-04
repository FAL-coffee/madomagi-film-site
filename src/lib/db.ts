import { Pool, type QueryResultRow } from "pg";
export type Film = {
  id: number;
  title: string;
  caption: string;
  name: string;
  created_at: string;
  width: number;
  height: number;
  visible: boolean;
  likes: number;
};
const globalDb = globalThis as unknown as { filmPool?: Pool };
function pool() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  return (globalDb.filmPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
  }));
}
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return pool().query<T>(text, values);
}
const fields =
  "f.id,f.title,f.caption,f.name,to_char(f.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS created_at,f.width,f.height,f.visible,(SELECT COUNT(*)::int FROM film_likes WHERE film_id=f.id) AS likes";
export async function getFilm(id: number, includeHidden = false) {
  return (
    await query<Film>(
      `SELECT ${fields} FROM film_posts f WHERE f.id=$1 ${includeHidden ? "" : "AND f.visible=true"}`,
      [id],
    )
  ).rows[0];
}
export async function listFilms(
  sort: "latest" | "popular" = "latest",
  page = 1,
  size = 12,
) {
  return (
    await query<Film>(
      `SELECT ${fields} FROM film_posts f WHERE f.visible=true ORDER BY ${sort === "popular" ? "likes DESC," : ""} f.id DESC LIMIT $1 OFFSET $2`,
      [size, (page - 1) * size],
    )
  ).rows;
}
export async function filmCount() {
  return (
    await query<{ total: number }>(
      "SELECT COUNT(*)::int AS total FROM film_posts WHERE visible=true",
    )
  ).rows[0].total;
}
export async function rateLimit(key: string, max: number, seconds: number) {
  const { rows } = await query<{ count: number }>(
    `INSERT INTO film_rate_limits(key,count,reset_at) VALUES ($1,1,now()+($2 * interval '1 second'))
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN film_rate_limits.reset_at<now() THEN 1 ELSE film_rate_limits.count+1 END,
    reset_at=CASE WHEN film_rate_limits.reset_at<now() THEN EXCLUDED.reset_at ELSE film_rate_limits.reset_at END RETURNING count`,
    [key, seconds],
  );
  return rows[0].count <= max;
}
