import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import pg from "pg";
import path from "node:path";

const base = process.env.SITE_URL || "http://localhost:3000";
const runName = `verification-${Date.now()}`;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let id;
try {
  await page.goto(base);
  await expect(
    page.getByRole("heading", { name: "最高のフィルムを決めよう" }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page.goto(`${base}/upload`);
  await page
    .locator("#image")
    .setInputFiles(path.resolve("public/film-logo.png"));
  await page.getByLabel("フィルムのタイトル").fill("動作確認用フィルム");
  await page.getByLabel("投稿者名").fill(runName);
  await page
    .getByLabel("ひとこと")
    .fill("自動検証用。この投稿は検証後に削除されます。");
  await page.locator("[name=consent]").check();
  await page.getByRole("button", { name: "このフィルムを公開する" }).click();
  await page.waitForURL(/\/films\/\d+$/, { timeout: 60000 });
  id = Number(page.url().split("/").pop());
  await expect(
    page.getByRole("heading", { name: "動作確認用フィルム" }),
  ).toBeVisible();
  const like = page.getByRole("button", { name: /このフィルムにいいね/ });
  await expect(like).toBeEnabled({ timeout: 20000 });
  await like.click();
  await expect(
    page.getByRole("button", { name: /いいねしました/ }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /いいねしました/ }),
  ).toBeDisabled();
  const duplicate = await context.request.post(`${base}/api/films/${id}`, {
    headers: { Origin: base },
    data: { action: "like" },
  });
  expect((await duplicate.json()).likes).toBe(1);
  expect(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
  ).toBe(`${base}/media/${id}`);
  const raw = await context.request.get(`${base}/films/${id}`);
  expect(await raw.text()).toContain("動作確認用フィルム");
  expect(
    (await context.request.get(`${base}/media/${id}`)).headers()[
      "content-type"
    ],
  ).toBe("image/jpeg");
  await page.getByRole("button", { name: "この投稿を通報する" }).click();
  await page.getByLabel("理由", { exact: true }).selectOption("その他");
  await page.getByRole("button", { name: "通報を送信" }).click();
  await expect(
    page.getByText("通報を受け付けました。管理者が内容を確認します。"),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/film-desktop.png", fullPage: true });
  const unauthorized = await context.request.get(`${base}/adminpage`);
  expect(unauthorized.status()).toBe(401);
  expect(
    (
      await context.request.post(`${base}/api/admin`, {
        headers: { Origin: base },
        data: { id, action: "visibility", visible: false },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await context.request.post(`${base}/api/films/${id}`, {
        headers: { Origin: "https://example.invalid" },
        data: { action: "like" },
      })
    ).status(),
  ).toBe(403);
  const admin = await browser.newContext({
    httpCredentials: {
      username: process.env.ADMIN_USER,
      password: process.env.ADMIN_PASSWORD,
    },
  });
  const adminPage = await admin.newPage();
  await adminPage.goto(`${base}/adminpage`);
  const row = adminPage
    .locator("article")
    .filter({ hasText: "動作確認用フィルム" });
  await expect(row).toBeVisible();
  await row.getByRole("switch").uncheck();
  await expect(row.getByRole("switch")).not.toBeChecked();
  await expect
    .poll(async () =>
      (await context.request.get(`${base}/media/${id}`)).status(),
    )
    .toBe(404);
  const hidden = await context.request.get(`${base}/films/${id}`);
  // Next streaming may return 200 with noindex for notFound; neither response may disclose the title.
  expect(await hidden.text()).not.toContain("動作確認用フィルム");
  expect((await context.request.get(`${base}/api/films/${id}`)).status()).toBe(
    404,
  );
  expect(
    await (await context.request.get(`${base}/sitemap.xml`)).text(),
  ).not.toContain(`/films/${id}<`);
  await row.getByRole("switch").check();
  await expect
    .poll(async () =>
      (await context.request.get(`${base}/media/${id}`)).status(),
    )
    .toBe(200);
  await row.getByRole("button", { name: "確認済みにする" }).click();
  await expect(
    adminPage.getByRole("heading", { name: "動作確認用フィルム" }),
  ).toHaveCount(0);
  await adminPage.goto(`${base}/adminpage?filter=all`);
  await expect(
    adminPage.getByRole("heading", { name: "動作確認用フィルム" }),
  ).toBeVisible();
  await adminPage.screenshot({ path: "artifacts/admin.png", fullPage: true });
  await admin.close();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/upload",
      `/films/${id}`,
      "/films?sort=popular",
    ]) {
      await page.goto(`${base}${route}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      for (const image of await page.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((i) => i.complete && i.naturalWidth > 0))
          .toBe(true);
      }
    }
    await page.goto(base);
    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((i) => i.complete && i.naturalWidth > 0))
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `artifacts/home-${width}.png`,
      fullPage: true,
    });
  }
  await client.query(
    `INSERT INTO film_posts(title,caption,name,width,height,image) SELECT 'ページング確認 ' || n,'',$1,f.width,f.height,f.image FROM film_posts f CROSS JOIN generate_series(1,13) n WHERE f.id=$2`,
    [runName, id],
  );
  await page.goto(`${base}/films`);
  await expect(page.getByRole("link", { name: "次のページ" })).toBeVisible();
  await page.getByRole("link", { name: "次のページ" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("link", { name: "前のページ" })).toBeVisible();
  expect(errors).toEqual([]);
  console.log(
    "PASS: upload, duplicate-like prevention, reports, Basic auth, visibility, private media, OGP, SSR, sitemap, pagination and responsive layouts.",
  );
} finally {
  await client.query("DELETE FROM film_posts WHERE name=$1", [runName]);
  await client.query("DELETE FROM film_rate_limits WHERE reset_at < now()");
  await client.end();
  await browser.close();
}
