import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Film as FilmIcon } from "lucide-react";
import type { Film } from "@/lib/db";
import { dateLabel } from "@/lib/site";
export function Gallery({ films }: { films: Film[] }) {
  if (!films.length)
    return (
      <div className="empty">
        <FilmIcon size={34} strokeWidth={1} />
        <div>
          <h3>最初のひとこまを、ここに。</h3>
          <p>まだフィルムが投稿されていません。</p>
        </div>
        <Link href="/upload">
          フィルムを投稿する <ArrowRight size={16} />
        </Link>
      </div>
    );
  return (
    <div className="gallery">
      {films.map((film) => (
        <Link className="film-card" href={`/films/${film.id}`} key={film.id}>
          <div className="film-image">
            <Image
              src={`/media/${film.id}`}
              alt={film.title}
              fill
              unoptimized
              sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
            <span className="film-number">
              NO. {String(film.id).padStart(4, "0")}
            </span>
          </div>
          <div className="film-info">
            <h3>{film.title}</h3>
            <span className="like-count">
              <Heart size={15} /> {film.likes}
            </span>
          </div>
          <div className="film-meta">
            <span>{film.name}</span>
            <time dateTime={film.created_at}>{dateLabel(film.created_at)}</time>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function SectionHeading({
  label,
  title,
  href,
}: {
  label: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link href={href}>
          すべて見る <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
