import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { filmCount, listFilms } from "@/lib/db";
import { Gallery } from "@/components/gallery";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ sort?: string; page?: string }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const s = await searchParams;
  return {
    title: s.sort === "popular" ? "人気のフィルム" : "新着フィルム",
    alternates: {
      canonical: `/films?sort=${s.sort === "popular" ? "popular" : "latest"}&page=${Number(s.page) || 1}`,
    },
  };
}
export default async function Films({ searchParams }: Props) {
  const s = await searchParams;
  const sort = s.sort === "popular" ? "popular" : "latest";
  const page = Number(s.page || 1);
  if (!Number.isSafeInteger(page) || page < 1) notFound();
  const total = await filmCount();
  const pages = Math.max(1, Math.ceil(total / 12));
  if (page > pages) notFound();
  const films = await listFilms(sort, page);
  return (
    <div className="wrap section">
      <div className="page-heading">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>{sort === "popular" ? "人気のフィルム" : "新着フィルム"}</h1>
        <p>投稿数：{total} 枚</p>
      </div>
      <div className="collection-toolbar">
        <div className="tabs">
          <Link
            aria-current={sort === "latest" ? "page" : undefined}
            href="/films"
          >
            新着順
          </Link>
          <Link
            aria-current={sort === "popular" ? "page" : undefined}
            href="/films?sort=popular"
          >
            いいね順
          </Link>
        </div>
        <span>
          {total ? (page - 1) * 12 + 1 : 0}–{Math.min(page * 12, total)} /{" "}
          {total}
        </span>
      </div>
      <Gallery films={films} />
      <nav className="pagination" aria-label="ページ切り替え">
        {page > 1 && (
          <Link
            aria-label="前のページ"
            href={`/films?sort=${sort}&page=${page - 1}`}
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        <span>
          {page} / {pages}
        </span>
        {page < pages && (
          <Link
            aria-label="次のページ"
            href={`/films?sort=${sort}&page=${page + 1}`}
          >
            <ChevronRight size={20} />
          </Link>
        )}
      </nav>
    </div>
  );
}
