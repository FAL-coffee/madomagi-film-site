"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
export function AdminControls({
  id,
  visible,
  unresolved,
}: {
  id: number;
  visible: boolean;
  unresolved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(visible);
  async function update(action: string) {
    setBusy(true);
    setError("");
    const previous = current;
    if (action === "visibility") setCurrent(!current);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, visible: !previous }),
      });
      if (!res.ok) throw Error("更新に失敗しました。");
      router.refresh();
    } catch (e) {
      setCurrent(previous);
      setError(e instanceof Error ? e.message : "更新に失敗しました。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-controls">
      <label className="toggle">
        <input
          type="checkbox"
          role="switch"
          aria-label={`フィルム ${id} を公開`}
          checked={current}
          disabled={busy}
          onChange={() => update("visibility")}
        />
        {current ? "公開中" : "非公開"}
      </label>
      {unresolved && (
        <button
          className="button"
          disabled={busy}
          onClick={() => update("resolve")}
        >
          <Check size={15} />
          確認済みにする
        </button>
      )}
      <span role="status" className="error-text">
        {error}
      </span>
    </div>
  );
}
