"use client";
import { useState } from "react";
import { getAdminKey, setAdminKey } from "@/lib/storage";
import { adminUploadFile } from "@/lib/api";

export default function ImportShippingZonesPage() {
  const [adminKey, setKey] = useState(getAdminKey());
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !adminKey) { setError("Informe a chave admin e selecione o arquivo"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      setAdminKey(adminKey);
      const r = await adminUploadFile(adminKey, "/admin/import/shipping-zones", file);
      setResult(r);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>📦 Importar Zonas de Frete</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label>Admin Key</label>
          <input value={adminKey} onChange={(e) => setKey(e.target.value)} type="password" placeholder="dev-admin-key-sp-2025" />
        </div>
        <div>
          <label>Arquivo Excel (.xlsx)</label>
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button className="btn-primary" onClick={handleUpload} disabled={loading}>
          {loading ? "Importando..." : "Importar"}
        </button>
        {result && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "1rem" }}>
            <p>✅ <strong>Zonas processadas:</strong> {result.zonesProcessed}</p>
            <p>✅ <strong>Ranges inseridos:</strong> {result.rangesInserted}</p>
            <p>🗑️ <strong>Ranges excluídos (soft):</strong> {result.rangesSoftDeleted}</p>
            {result.errors?.length > 0 && <p>⚠️ Erros: {result.errors.length}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
