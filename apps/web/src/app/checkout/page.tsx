"use client";
import { useState } from "react";
import { getCart, clearCart } from "@/lib/storage";
import { createOrder, fetchShippingQuote } from "@/lib/api";

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cart = getCart();
  const subtotal = cart.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  const handleQuoteShipping = async () => {
    if (!cep) return;
    try {
      const q = await fetchShippingQuote(cep);
      setShippingInfo(q);
    } catch (e: any) {
      setShippingInfo(null);
      setError(e.message);
    }
  };

  const handleCheckout = async () => {
    if (!name || !cep) { setError("Nome e CEP são obrigatórios"); return; }
    if (!cart.length) { setError("Carrinho vazio"); return; }
    setLoading(true);
    setError("");
    try {
      const resp = await createOrder({
        customerName: name,
        customerEmail: email || undefined,
        customerCep: cep,
        items: cart.map((i) => ({ productCode: i.productCode, quantity: i.quantity, sellType: i.sellType })),
      });
      setResult(resp);
      clearCart();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ color: "#16a34a", marginBottom: "1rem" }}>✅ Pedido realizado!</h1>
        <p><strong>ID:</strong> {result.orderId}</p>
        <p><strong>Status:</strong> {result.status}</p>
        <p><strong>Frete:</strong> R$ {Number(result.shippingPrice).toFixed(2)} ({result.shippingZone})</p>
        <p><strong>Total:</strong> R$ {Number(result.total).toFixed(2)}</p>
        {result.assignedDistributor && (
          <p><strong>Distribuidor:</strong> {result.assignedDistributor.name} ({result.assignedDistributor.distanceKm} km)</p>
        )}
        <a href={`/track?id=${result.orderId}`} style={{ display: "inline-block", marginTop: "1rem" }} className="btn-primary">
          Rastrear Pedido
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>🛒 Checkout</h1>

      {cart.length === 0 ? (
        <p>Seu carrinho está vazio. <a href="/">Ver catálogo</a></p>
      ) : (
        <>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Itens</h3>
            {cart.map((i) => (
              <div key={`${i.productCode}-${i.sellType}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>{i.productName} ({i.sellType}) × {i.quantity}</span>
                <span>R$ {(i.unitPrice * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: "0.75rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Subtotal</strong>
              <strong>R$ {subtotal.toFixed(2)}</strong>
            </div>
            {shippingInfo && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span>Frete ({shippingInfo.zoneName})</span>
                <span>R$ {Number(shippingInfo.price).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Nome*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label>CEP*</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" maxLength={9} />
                <button className="btn-secondary" type="button" onClick={handleQuoteShipping}>
                  Consultar frete
                </button>
              </div>
            </div>

            {error && <p style={{ color: "#dc2626" }}>{error}</p>}

            <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
              {loading ? "Processando..." : "Finalizar Pedido"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
