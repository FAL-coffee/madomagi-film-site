import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Film, Plus, ArrowUpRight } from "lucide-react";
import { description, siteName, siteUrl } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description,
  openGraph: {
    title: siteName,
    description,
    siteName,
    locale: "ja_JP",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/opengraph-image"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">
          本文へ移動
        </a>
        <header className="header">
          <Link
            className="wordmark"
            href="/"
            aria-label="フィルムギャラリー ホーム"
          >
            <Film size={24} />
            <span>
              FILM ARCHIVE<small>WALPURGISNACHT: RISING</small>
            </span>
          </Link>
          <nav aria-label="メインナビゲーション">
            <Link href="/films">新着フィルム</Link>
            <Link href="/films?sort=popular">人気のフィルム</Link>
            <Link className="nav-upload" href="/upload">
              <Plus size={17} />
              <span>投稿する</span>
            </Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="footer">
          <div>
            <p>
              魔法少女まどか☆マギカ〈ワルプルギスの廻天〉
              <br />
              非公式ファンギャラリー
            </p>
          </div>
          <div className="footer-links">
            <Link href="/guide">開封・保存の注意点</Link>
            <Link href="/about">このサイトについて</Link>
            <a
              href="https://www.madoka-magica.com/wr/"
              target="_blank"
              rel="noreferrer"
            >
              作品公式サイト <ArrowUpRight size={14} />
            </a>
          </div>
          <small>
            本サイトは作品の製作・配給元とは関係ありません。
            <br />
            投稿画像の権利はそれぞれの権利者に帰属します。
          </small>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
