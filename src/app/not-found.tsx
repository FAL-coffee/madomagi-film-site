import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap section narrow">
      <div className="page-heading">
        <span className="eyebrow">404 / NOT FOUND</span>
        <h1>このひとこまは、見つかりません。</h1>
        <p>投稿が非公開になったか、ページが存在しません。</p>
      </div>
      <Link href="/films" className="button primary">
        フィルム一覧へ
      </Link>
    </div>
  );
}
