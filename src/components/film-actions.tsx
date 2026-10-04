"use client";
import { useEffect, useState } from "react";
import { Heart, Share2, Flag, X, Check, Copy } from "lucide-react";
export function FilmActions({
  id,
  initialLikes,
  title,
  url,
}: {
  id: number;
  initialLikes: number;
  title: string;
  url: string;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("不適切な画像・内容");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/films/${id}`)
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (active) {
          setLikes(data.likes);
          setLiked(data.liked);
          setReported(data.reported);
          setReady(true);
        }
      })
      .catch(() => {
        if (active)
          setMessage(
            "状態を取得できませんでした。ページを再読み込みしてください。",
          );
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function action(kind: "like" | "report") {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/films/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: kind, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (kind === "like") {
        setLikes(data.likes);
        setLiked(true);
      } else {
        setReported(true);
        setOpen(false);
        setMessage("通報を受け付けました。管理者が内容を確認します。");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "通信に失敗しました。",
      );
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("リンクをコピーしました。");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("共有できませんでした。リンクのコピーをお試しください。");
    }
  }
  return (
    <div className="film-actions">
      <button
        className={`button like-button ${liked ? "is-liked" : ""}`}
        onClick={() => action("like")}
        disabled={!ready || busy || liked}
        aria-pressed={liked}
      >
        <Heart size={21} fill={liked ? "currentColor" : "none"} />
        <span>{liked ? "いいねしました" : "このフィルムにいいね"}</span>
        <strong>{likes}</strong>
      </button>
      <small>いいねは1ブラウザにつき1回</small>
      <div className="share-row">
        <a
          className="button"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} #まどマギ #ワルプルギスの廻天`)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
        >
          Xで共有
        </a>
        <button
          className="icon-button"
          title="その他の方法で共有"
          aria-label="その他の方法で共有"
          onClick={share}
        >
          <Share2 size={19} />
        </button>
        <button
          className="icon-button"
          title="リンクをコピー"
          aria-label="リンクをコピー"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setMessage("リンクをコピーしました。");
            } catch {
              setMessage("リンクをコピーできませんでした。");
            }
          }}
        >
          <Copy size={19} />
        </button>
      </div>
      <button
        className="report-link"
        disabled={!ready || reported}
        onClick={() => setOpen(!open)}
      >
        {reported ? <Check size={15} /> : <Flag size={15} />}{" "}
        {reported ? "通報済み" : "この投稿を通報する"}
      </button>
      {open && (
        <form
          className="report-form"
          onSubmit={(e) => {
            e.preventDefault();
            action("report");
          }}
        >
          <div className="form-heading">
            <strong>通報の理由</strong>
            <button
              type="button"
              className="icon-button"
              aria-label="閉じる"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <label htmlFor="reason" className="sr-only">
            理由
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {[
              "権利侵害の疑い",
              "作品と無関係",
              "不適切な画像・内容",
              "個人情報が含まれる",
              "その他",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button className="button" disabled={busy}>
            通報を送信
          </button>
        </form>
      )}
      <p className="status" role="status">
        {message}
      </p>
    </div>
  );
}
