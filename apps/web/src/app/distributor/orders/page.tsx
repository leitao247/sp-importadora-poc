"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDistributorAuth, clearDistributorAuth } from "@/lib/storage";
import { fetchDistributorOrders, updateDistributorOrderStatus } from "@/lib/api";

const NEXT_STATUS: Record<string, string[]> = {
  ASSIGNED: ["ACCEPTED", "CANCELED"],
  ACCEPTED: ["PACKING", "CANCELED"],
  PACKING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

const STATUS_LABEL: Record<string, string> = {
  ASSIGNED: "Aguardando", ACCEPTED: "Aceito", PACKING: "Separando",
  SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELED: "Cancelado",
};

export default function DistributorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const auth = getDistributorAuth();

  useEffect(() => {
    if (!auth) { router.push("/distributor/login"); return; }
    fetchDistributorOrders(auth.code, auth.key)
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const advance = async (orderId: string, to: string) => {
    if (!auth) return;
    try {
      await updateDistributorOrderStatus(auth.code, auth.key, orderId, to);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: to } : o));
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>📦 Meus Pedidos</h1>
        <button className="btn-secondary" onClick={() => { clearDistributorAuth(); router.push("/distributor/login"); }}>Sair</button>
      </div>
      {orders.length === 0 ? <p>Nenhum pedido encontrado.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((o) => (
            <div key={o.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p><strong>{o.customerName}</strong> — CEP {o.customerCep}</p>
                  <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{o.id.slice(-8).toUpperCase()}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p><strong>R$ {Number(o.total).toFixed(2)}</strong></p>
                  <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{STATUS_LABEL[o.status] || o.status}</p>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(NEXT_STATUS[o.status] || []).map((next) => (
                  <button key={next} className={next === "CANCELED" ? "btn-danger" : "btn-primary"} style={{ fontSize: "0.85rem" }} onClick={() => advance(o.id, next)}>
                    → {STATUS_LABEL[next] || next}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
