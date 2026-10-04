"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, ArrowRight, LoaderCircle, X } from "lucide-react";
export function UploadForm() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function choose(candidate?: File) {
    setError("");
    if (!candidate) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(candidate.type) ||
      candidate.size > 10 * 1024 * 1024
    ) {
      setError("JPEG・PNG・WebPの画像（10MB以下）を選んでください。");
      return;
    }
    setFile(candidate);
    setPreview(URL.createObjectURL(candidate));
  }
  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("画像を選んでください。");
      return;
    }
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    data.set("image", file);
    try {
      const res = await fetch("/api/films", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      router.push(`/films/${result.id}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "投稿できませんでした。再度お試しください。",
      );
      setBusy(false);
    }
  }
  return (
    <form className="upload-form" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend className="sr-only">フィルムの投稿</legend>
        <div
          className={`dropzone ${drag ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (!busy) choose(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={input}
            id="image"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => choose(e.target.files?.[0])}
          />
          {file && preview ? (
            <>
              <Image
                src={preview}
                width={640}
                height={400}
                unoptimized
                alt="投稿画像のプレビュー"
              />
              <button
                type="button"
                className="remove-image icon-button"
                aria-label="画像を取り消す"
                onClick={() => {
                  setFile(null);
                  setPreview("");
                  if (input.current) input.current.value = "";
                }}
              >
                <X size={18} />
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => input.current?.click()}
              >
                別の画像を選ぶ
              </button>
            </>
          ) : (
            <button
              type="button"
              className="drop-trigger"
              onClick={() => input.current?.click()}
            >
              <ImagePlus size={38} strokeWidth={1} />
              <strong>フィルムの画像を選ぶ</strong>
              <span>または、ここにドラッグ＆ドロップ</span>
              <small>JPEG / PNG / WebP · 10MBまで</small>
            </button>
          )}
        </div>
        <label htmlFor="title">
          フィルムのタイトル <span>必須</span>
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
          placeholder="例：まどかのアップ"
        />
        <label htmlFor="name">
          投稿者名 <span>任意</span>
        </label>
        <input
          id="name"
          name="name"
          maxLength={40}
          placeholder="匿名の魔法少女"
          autoComplete="nickname"
        />
        <label htmlFor="caption">
          ひとこと <span>任意</span>
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={4}
          maxLength={1000}
          placeholder="シーンの説明など"
        />
        <label className="consent">
          <input type="checkbox" name="consent" required />
          <span>
            自分で撮影したフィルム画像であり、公開して差し支えないことを確認しました。個人情報や第三者の無断転載は含みません。
          </span>
        </label>
        <p className="muted">投稿はすぐに公開されます。ログインは不要です。</p>
        <button className="button primary submit" type="submit">
          {busy ? (
            <>
              <LoaderCircle className="spin" size={18} />
              投稿しています…
            </>
          ) : (
            <>
              このフィルムを公開する <ArrowRight size={18} />
            </>
          )}
        </button>
      </fieldset>
      <p className="error-text" role="alert">
        {error}
      </p>
    </form>
  );
}
