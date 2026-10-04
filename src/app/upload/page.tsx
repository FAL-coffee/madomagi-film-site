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
        <span className="eyebrow">UPLOAD</span>
        <h1>フィルムを投稿する</h1>
      </div>
      <UploadForm />
      <p className="form-footnote">
        撮影する前に <Link href="/guide">開封・保存の注意点</Link>{" "}
        をご確認ください。
      </p>
    </div>
  );
}
