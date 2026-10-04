import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { AdminControls } from "@/components/admin-controls";
import { dateLabel } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "投稿管理",
  robots: { index: false, follow: false },
};
type Report = {
  id: number;
  title: string;
  visible: boolean;
  count: number;
  reasons: string;
  unresolved: boolean;
  last_report: Date;
};
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  if (!isAdmin((await headers()).get("authorization"))) notFound();
  const { filter, page: rawPage } = await searchParams;
  const all = filter === "all";
  const page = Number(rawPage || 1);
  if (!Number.isSafeInteger(page) || page < 1) notFound();
  const reports = (
    await query<Report>(
      `SELECT f.id,f.title,f.visible,COUNT(*)::int AS count,STRING_AGG(DISTINCT r.reason, ' / ') AS reasons, BOOL_OR(NOT r.resolved) AS unresolved,MAX(r.created_at) AS last_report FROM film_posts f JOIN film_reports r ON r.film_id=f.id GROUP BY f.id ${all ? "" : "HAVING BOOL_OR(NOT r.resolved)"} ORDER BY MAX(r.created_at) DESC LIMIT 21 OFFSET $1`,
      [(page - 1) * 20],
    )
  ).rows;
  return (
    <div className="wrap section">
      <div className="page-heading">
        <span className="eyebrow">MODERATION</span>
        <h1>通報されたフィルム</h1>
        <p>内容を確認して、公開状態を変更できます。</p>
      </div>
      <div className="collection-toolbar">
        <div className="tabs">
          <Link href="/adminpage" aria-current={!all ? "page" : undefined}>
            未確認
          </Link>
          <Link
            href="/adminpage?filter=all"
            aria-current={all ? "page" : undefined}
          >
            すべての通報
          </Link>
        </div>
      </div>
      <div className="admin-list">
        {reports.slice(0, 20).map((report) => (
          <article className="admin-row" key={report.id}>
            <Image
              unoptimized
              src={`/media/${report.id}`}
              alt={report.title}
              width={130}
              height={90}
            />
            <div>
              <small>
                NO. {report.id} / {dateLabel(report.last_report.toISOString())}
              </small>
              <h2>{report.title}</h2>
              <p>{report.reasons}</p>
              <small>
                {report.count} 件の通報 ·{" "}
                {report.unresolved ? "未確認" : "確認済み"}
              </small>
            </div>
            <AdminControls
              id={report.id}
              visible={report.visible}
              unresolved={report.unresolved}
            />
          </article>
        ))}
        {!reports.length && (
          <div className="empty">
            <p>該当する通報はありません。</p>
          </div>
        )}
      </div>
      <nav className="pagination" aria-label="管理画面のページ切り替え">
        {page > 1 && (
          <Link
            href={`/adminpage?filter=${all ? "all" : "open"}&page=${page - 1}`}
          >
            前へ
          </Link>
        )}
        <span>{page}</span>
        {reports.length > 20 && (
          <Link
            href={`/adminpage?filter=${all ? "all" : "open"}&page=${page + 1}`}
          >
            次へ
          </Link>
        )}
      </nav>
    </div>
  );
}
