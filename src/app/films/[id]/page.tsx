import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFilm } from "@/lib/db";
import { dateLabel, parseId, siteUrl } from "@/lib/site";
import { FilmActions } from "@/components/film-actions";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const film = await getFilm(parseId((await params).id));
  if (!film)
    return {
      title: "フィルムが見つかりません",
      robots: { index: false, follow: false },
      openGraph: { images: [] },
    };
  const shareTitle = `${film.title}｜まどマギ廻天のフィルムを投稿しよう！`;
  return {
    title: `${film.title} | フィルム #${film.id}`,
    description:
      film.caption ||
      `${film.name}さんが投稿したフィルム。`,
    alternates: { canonical: `/films/${film.id}` },
    openGraph: {
      title: shareTitle,
      url: `/films/${film.id}`,
      images: [
        {
          url: `/media/${film.id}`,
          width: film.width,
          height: film.height,
          alt: film.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      images: [`/media/${film.id}`],
    },
  };
}
export default async function FilmPage({ params }: Props) {
  const film = await getFilm(parseId((await params).id));
  if (!film) notFound();
  return (
    <div className="wrap section">
      <Link className="back-link" href="/films">
        <ArrowLeft size={16} />
        フィルム一覧へ
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <Image
            src={`/media/${film.id}`}
            alt={film.title}
            width={film.width}
            height={film.height}
            unoptimized
            priority
          />
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            FILM NO. {String(film.id).padStart(4, "0")}
          </span>
          <h1>{film.title}</h1>
          <p className="credit">
            {film.name}
            <br />
            <time dateTime={film.created_at}>{dateLabel(film.created_at)}</time>
          </p>
          {film.caption && <p className="caption">{film.caption}</p>}
          <FilmActions
            id={film.id}
            initialLikes={film.likes}
            title={film.title}
            url={`${siteUrl}/films/${film.id}`}
          />
        </div>
      </div>
    </div>
  );
}
