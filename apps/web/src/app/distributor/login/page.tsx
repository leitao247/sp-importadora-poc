"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setDistributorAuth } from "@/lib/storage";
import { fetchDistributorOrders } from "@/lib/api";

export default function DistributorLoginPage() {
  const [code, setCode] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!code || !key) { setError("Informe código e chave"); return; }
    setLoading(true); setError("");
    try {
      await fetchDistributorOrders(code, key);
      setDistributorAuth(code, key);
      router.push("/distributor/orders");
    } catch (e: any) {
      setError("Credenciais inválidas: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>🏭 Portal do Distribuidor</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label>Código do Distribuidor</label><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DISTR_PR_001" /></div>
        <div><label>API Key</label><input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="dev-distr-key-pr001" /></div>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button className="btn-primary" onClick={handleLogin} disabled={loading}>{loading ? "Verificando..." : "Entrar"}</button>
      </div>
    </div>
  );
}
