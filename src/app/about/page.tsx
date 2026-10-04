export const metadata = {
  title: "このサイトについて",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <article className="wrap section narrow prose">
      <div className="page-heading">
        <span className="eyebrow">ABOUT THIS ARCHIVE</span>
        <h1>このサイトについて</h1>
      </div>
      <section>
        <h2>サイトの概要</h2>
        <p>
          『魔法少女まどか☆マギカ〈ワルプルギスの廻天〉』のフィルムを楽しむ、非公式のファンギャラリーです。作品の製作・配給元とは関係ありません。
        </p>
        <p>
          気に入ったフィルムには、1ブラウザにつき1回「いいね」を送れます。ブラウザの保存データを削除した場合や、別のブラウザ・端末を使った場合は、同一の利用者として判別できません。
        </p>
      </section>
      <section>
        <h2>投稿について</h2>
        <p>
          自分で撮影したフィルムの画像を投稿してください。他者の画像の無断転載、個人情報、作品と無関係な内容、嫌がらせを含む投稿はお控えください。投稿は一般公開され、SNS共有のプレビューにも画像が表示されます。
        </p>
        <p>
          不適切な投稿は管理者の判断で非公開にすることがあります。投稿の取り下げを希望する場合や、権利上の問題がある場合は、該当するフィルムページの通報機能でお知らせください。
        </p>
      </section>
      <section>
        <h2>保存される情報</h2>
        <p>
          画像、タイトル、投稿者名、コメント、投稿日時、いいね・通報の情報を保存します。アップロードした画像は再変換し、位置情報などの画像メタデータを除去します。
        </p>
        <p>
          重複したいいねや連続投稿を抑えるために、ランダムな識別子をCookieに保存します。Cookieはログインや広告目的には使用しません。外部フォントの読み込みとSNS共有先への移動では、それぞれの提供元へ接続します。
        </p>
      </section>
      <section>
        <h2>作品と素材について</h2>
        <p>
          作品名・ロゴ・公式画像の権利は各権利者に帰属します。公式情報は{" "}
          <a
            href="https://www.madoka-magica.com/wr/"
            target="_blank"
            rel="noreferrer"
          >
            作品公式サイト
          </a>{" "}
          をご覧ください。
        </p>
      </section>
    </article>
  );
}
