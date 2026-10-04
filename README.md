# まどマギ フィルムギャラリー

『魔法少女まどか☆マギカ〈ワルプルギスの廻天〉』の非公式ファンギャラリー。
Next.js App Router / TypeScript / Neon PostgreSQL。SEOと画像OGPのため、SSRが使えるNext.jsを採用しています。開発・ビルドはTurbopackで、Viteとの併用はしていません。

## 起動

Node.js 22以上を使用します。

```powershell
cd D:\workspace\madomagi-film-site
npm ci
Copy-Item .env.example .env.local # 既存の .env.local がある場合は上書きしない
# .env.local の各値を設定
npm run db:migrate
npm run dev
```

http://localhost:3000 で閲覧できます。今回のローカル環境には `.env.local` を設定済みです。接続情報・管理者パスワードはGit管理外です。

| 環境変数         | 用途                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`   | Neon PostgreSQLの接続文字列。サーバー専用                                 |
| `SITE_URL`       | このサイトのURL。本番ではHTTPSの公開URL。OGP・canonical・Origin検証に利用 |
| `ADMIN_USER`     | `/adminpage` のBasic認証ユーザー名                                        |
| `ADMIN_PASSWORD` | Basic認証パスワード                                                       |
| `COOKIE_SECRET`  | ブラウザ識別Cookieの署名用。32文字以上のランダム値                        |

## 実装済み

- トップの新着6件・人気3件、一覧の12件ごとのページング
- ログイン不要の投稿、画像プレビュー、入力エラー表示
- JPEG / PNG / WebP、最大10MB・4000万画素。長辺2400pxまでに縮小してJPEGへ変換し、EXIFを除去
- PostgreSQLの整数IDENTITYによる連番ID（削除・失敗時には欠番が発生します）
- 署名付きHttpOnly CookieとDBの一意制約で、同じブラウザからの重複いいねを防止
- X共有、Web Share API、リンクコピー、理由付き通報
- Basic認証付き `/adminpage`、通報一覧、公開・非公開スイッチ、確認済み処理
- 公開投稿のみを一覧・詳細・画像URL・サイトマップに表示
- SSR、ページ別タイトル・説明・canonical、詳細ページの投稿画像OGP、robots.txt、sitemap.xml
- 開封・保存の注意点、サイト説明、モバイル表示

## データ

`npm run db:migrate` が `db/schema.sql` を適用します。専用の `film_posts` / `film_likes` / `film_reports` / `film_rate_limits` テーブルを作成し、既存の別テーブルを変更しません。

画像はPostgreSQLの `bytea` 列に保存します。ローカルディスクへ依存せず、画像とメタデータが同時に保存されます。大量運用時は容量・転送コストに合わせてオブジェクトストレージへの移行を検討してください。

NeonのData APIは使用しません。各テーブルではRLSを有効化し、匿名向けポリシーを作成していません。サーバーは提供されたDB所有者の接続でアクセスします。Data API側に別途広い権限を付与しないでください。

Cookie削除や別端末までは同一人物と識別できません。投稿は1ブラウザ毎時10件、いいね・通報は毎分60操作まで。大量の悪用に対するネットワーク単位の制限やCAPTCHAはホスティング側で追加できます。

非公開切り替え後は画像URLも404になります。外部SNSがすでに保存したプレビュー画像までは削除できません。

## 検証

```powershell
npm run lint
npm run build
npx playwright install chromium
# 別プロセスで npm run dev を起動してから実行
npm run test:e2e
```

E2Eは実際のDBに固有の検証投稿を作成し、投稿・いいね・通報・管理・画像非公開・OGP・ページング・レスポンシブ表示を検証します。終了時に自身の検証投稿のみ削除します。スクリーンショットはGit管理外の `artifacts/` に出力します。

## 公開時の設定

ホスティング先へ上記環境変数を設定し、`npm run build` / `npm start` で起動します。`SITE_URL` は最終的な公開URLに変更してください。Basic認証のためHTTPSが必要です。プラットフォームのリクエストサイズ上限が10MBより小さい場合は、アップロード制限を合わせてください。

公式サイト由来の画像・ロゴの一覧は [ASSETS.md](ASSETS.md) に記載しています。公開利用の許諾は未確認です。

依存関係の監査で開発用ESLintの間接依存 `braces` に既知の問題が報告されています。互換性のない旧Next.js ESLint設定への自動ダウングレードは適用していません。本番依存は `npm audit --omit=dev` で確認できます。
