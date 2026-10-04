import type { MetadataRoute } from "next";
import { query } from "@/lib/db";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const films = (
    await query<{ id: number; created_at: Date }>(
      "SELECT id,created_at FROM film_posts WHERE visible=true ORDER BY id DESC LIMIT 49000",
    )
  ).rows;
  return [
    ...["", "/films", "/upload", "/guide", "/about"].map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...films.map((f) => ({
      url: `${siteUrl}/films/${f.id}`,
      lastModified: f.created_at,
      priority: 0.8,
    })),
  ];
}
