"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackPage() {
  const [id, setId] = useState("");
  const router = useRouter();

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>📦 Rastrear Pedido</h1>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <input
          value={id}
          onChange={(e) => setId(e.target.value.trim())}
          placeholder="ID do pedido"
        />
        <button
          className="btn-primary"
          onClick={() => { if (id) router.push(`/track/${id}`); }}
        >
          Rastrear
        </button>
      </div>
    </div>
  );
}
