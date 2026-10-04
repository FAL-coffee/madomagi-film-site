import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { filmCount, listFilms } from "@/lib/db";
import { Gallery, SectionHeading } from "@/components/gallery";
export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const [latest, popular, total] = await Promise.all([
    listFilms("latest", 1, 6),
    listFilms("popular", 1, 3),
    filmCount(),
  ]);
  return (
    <>
      <section className="intro">
        <div className="intro-topline">
          <span>UNOFFICIAL FAN GALLERY</span>
          <span>COLLECTION / {String(total).padStart(4, "0")} FILMS</span>
        </div>
        <Image
          className="movie-logo"
          src="/film-logo.png"
          alt="劇場版 魔法少女まどか☆マギカ〈ワルプルギスの廻天〉"
          width={1634}
          height={476}
          priority
        />
        <h1>最高のフィルムを決めよう</h1>
        <p>あなたの手元に届いた、たったひとつの物語。</p>
        <div className="intro-actions">
          <Link className="button primary" href="/upload">
            <Plus size={18} />
            フィルムを投稿する
          </Link>
          <Link className="text-link" href="/films">
            みんなのフィルムを見る <ArrowRight size={18} />
          </Link>
        </div>
        <div className="intro-note">
          <span>ログイン不要</span>
          <span>あなたの「いいね」を一枚に</span>
        </div>
      </section>
      <div className="spoiler-bar">
        <Sparkles size={15} />
        <span>このギャラリーには、本編の内容に触れる画像が含まれます。</span>
        <span className="small-label">SPOILER ALERT</span>
      </div>
      <section className="section wrap">
        <SectionHeading
          label="01 / NEW ARRIVALS"
          title="届いたばかりのフィルム"
          href="/films"
        />
        <Gallery films={latest} />
      </section>
      <section className="popular-band">
        <div className="wrap section">
          <SectionHeading
            label="02 / MOST LOVED"
            title="みんなが選んだひとこま"
            href="/films?sort=popular"
          />
          <Gallery films={popular} />
        </div>
      </section>
      <section className="care-banner wrap">
        <span className="eyebrow">KEEP YOUR MEMORIES</span>
        <div>
          <h2>大切なフィルムを、これからも。</h2>
          <p>
            開封するときも、しまうときも。小さな気づかいで、ひとこまを長く美しく。
          </p>
        </div>
        <Link className="text-link" href="/guide">
          開封・保存の注意点 <ArrowRight size={18} />
        </Link>
      </section>
      <figure className="official-art">
        <a
          href="https://www.madoka-magica.com/wr/"
          target="_blank"
          rel="noreferrer"
          aria-label="作品公式サイトを見る"
        >
          <Image
            src="/official/key-visual.jpg"
            alt="魔法少女まどか☆マギカ〈ワルプルギスの廻天〉公式キービジュアル"
            width={1416}
            height={2003}
            sizes="(max-width: 600px) 100vw, 420px"
          />
        </a>
        <figcaption>
          作品公式サイトへ ↗<br />
          <small>©Magica Quartet/Aniplex,Madoka Project</small>
        </figcaption>
      </figure>
    </>
  );
}
