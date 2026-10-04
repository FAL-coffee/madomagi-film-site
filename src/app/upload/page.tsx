import { UploadForm } from "@/components/upload-form";
import Link from "next/link";
export const metadata = {
  title: "フィルムを投稿する",
  alternates: { canonical: "/upload" },
};
export default function Upload() {
  return (
    <div className="wrap section narrow">
      <div className="page-heading">
        <span className="eyebrow">ADD YOUR FRAME</span>
        <h1>あなたのひとこまを。</h1>
        <p>大切なフィルムを、みんなのコレクションへ。</p>
      </div>
      <UploadForm />
      <p className="form-footnote">
        撮影する前に <Link href="/guide">開封・保存の注意点</Link>{" "}
        をご確認ください。
      </p>
    </div>
  );
}
