"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap section narrow">
      <div className="page-heading">
        <h1>読み込みに失敗しました。</h1>
        <p>しばらく待ってから、もう一度お試しください。</p>
      </div>
      <button className="button primary" onClick={reset}>
        もう一度読み込む
      </button>
    </div>
  );
}
