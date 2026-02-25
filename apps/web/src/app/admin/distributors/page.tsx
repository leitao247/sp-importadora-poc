"use client";
import { useState, useEffect } from "react";
import { getAdminKey, setAdminKey } from "@/lib/storage";
import { adminListDistributors, adminRotateKey } from "@/lib/api";

export default function AdminDistributorsPage() {
  const [adminKey, setKey] = useState(getAdminKey());
  const [distributors, setDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newKeys, setNewKeys] = useState<Record<string, string>>({});

  const load = async () => {
    if (!adminKey) return;
    setLoading(true); setError("");
    try {
      setAdminKey(adminKey);
      const data = await adminListDistributors(adminKey);
      setDistributors(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (adminKey) load(); }, []);

  const handleRotate = async (code: string) => {
    try {
      const r = await adminRotateKey(adminKey, code);
      setNewKeys((prev) => ({ ...prev, [code]: r.newApiKey }));
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>🏭 Distribuidores</h1>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input value={adminKey} onChange={(e) => setKey(e.target.value)} type="password" placeholder="Admin Key" style={{ maxWidth: 300 }} />
        <button className="btn-primary" onClick={load} disabled={loading}>{loading ? "..." : "Carregar"}</button>
      </div>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {["Código", "Nome", "CEP", "Lat/Lng", "Raio (km)", "Status", "Ações"].map((h) => (
              <th key={h} style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb", fontSize: "0.85rem" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {distributors.map((d) => (
            <tr key={d.code}>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb", fontFamily: "monospace" }}>{d.code}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{d.name}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{d.cep}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.8rem" }}>{d.lat?.toFixed(4)}, {d.lng?.toFixed(4)}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{d.serviceRadiusKm || "-"}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{d.active ? "✅ Ativo" : "❌ Inativo"}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>
                <button className="btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => handleRotate(d.code)}>
                  🔑 Rotacionar Key
                </button>
                {newKeys[d.code] && (
                  <p style={{ fontFamily: "monospace", fontSize: "0.75rem", marginTop: 4, color: "#16a34a" }}>
                    Nova key: {newKeys[d.code]}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
