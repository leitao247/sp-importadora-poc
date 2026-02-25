"use client";
import { useEffect, useState } from "react";
import { fetchPublicTracking } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  CREATED: "Criado",
  ASSIGNED: "Aguardando distribuidor",
  ACCEPTED: "Aceito pelo distribuidor",
  PACKING: "Em separação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export default function TrackDetailPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicTracking(params.orderId)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [params.orderId]);

  if (error) return <p style={{ color: "#dc2626" }}>Erro: {error}</p>;
  if (!order) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>📦 Pedido #{order.orderId.slice(-8).toUpperCase()}</h1>
      <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
        Status: <strong>{STATUS_LABEL[order.status] || order.status}</strong>
      </p>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Itens</h3>
        {order.items.map((i: any) => (
          <div key={i.productCode} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>{i.productName} × {i.quantity}</span>
            <span>R$ {Number(i.lineTotal).toFixed(2)}</span>
          </div>
        ))}
        <hr style={{ margin: "0.75rem 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span><span>R$ {order.totals.subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Frete ({order.shippingZone || "-"})</span><span>R$ {order.totals.shipping.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>Total</span><span>R$ {order.totals.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Histórico de Status</h3>
        {order.history.map((h: any, i: number) => (
          <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: 8 }}>
            <span style={{ color: "#6b7280", fontSize: "0.8rem", minWidth: 160 }}>
              {new Date(h.at).toLocaleString("pt-BR")}
            </span>
            <span>
              {h.from ? `${STATUS_LABEL[h.from]} → ` : ""}
              <strong>{STATUS_LABEL[h.to] || h.to}</strong>
              {h.note && <em style={{ color: "#6b7280" }}> — {h.note}</em>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
