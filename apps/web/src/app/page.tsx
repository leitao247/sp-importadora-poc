"use client";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import { addToCart } from "@/lib/storage";

interface Product {
  id: string;
  code: string;
  name: string;
  priceBox: number;
  priceUnit: number;
  unitsPerBox: number;
  bottleMl?: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  const load = async (query?: string) => {
    setLoading(true);
    try {
      const data = await fetchProducts(query);
      setProducts(data);
      setApiOk(true);
    } catch {
      setApiOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = (p: Product, sellType: "UNIT" | "BOX") => {
    addToCart({
      productCode: p.code,
      productName: p.name,
      quantity: 1,
      sellType,
      unitPrice: sellType === "UNIT" ? p.priceUnit : p.priceBox,
      priceBox: p.priceBox,
      unitsPerBox: p.unitsPerBox,
    });
    setAdded(`${p.code}-${sellType}`);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div>
      <h1 style={{ marginBottom: "1rem", color: "#1a1a2e" }}>🍷 S&P Importadora — MVP</h1>

      {/* Comece por aqui */}
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>✅ Comece por aqui (1 clique)</h2>
        <p style={{ color: "#6b7280", marginBottom: "0.75rem" }}>
          Se você só quer testar o MVP, rode <code>pnpm mvp</code> no terminal e depois siga os links abaixo.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <a className="btn-secondary" style={btnLink} href="/admin">🛠 Admin</a>
          <a className="btn-secondary" style={btnLink} href="/admin/imports/shipping-zones">📦 Importar Frete</a>
          <a className="btn-secondary" style={btnLink} href="/admin/imports/distributors">🏭 Importar Distribuidores</a>
          <a className="btn-secondary" style={btnLink} href="/admin/imports/products">🍷 Importar Produtos</a>
          <a className="btn-primary" style={btnLink} href="/checkout">🛒 Ir para Checkout</a>
          <a className="btn-secondary" style={btnLink} href="/track">📦 Tracking</a>
          <a className="btn-secondary" style={btnLink} href="/distributor/login">🏭 Portal Distribuidor</a>
        </div>

        <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#6b7280" }}>
          Status da API: {apiOk === null ? "..." : apiOk ? "✅ OK" : "❌ OFF (confira .env e pnpm mvp)"}
        </div>
      </section>

      <h2 style={{ marginBottom: "0.75rem" }}>Catálogo</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar vinho..."
          style={{ maxWidth: 400 }}
        />
        <button className="btn-primary" onClick={() => load(q)}>Buscar</button>
        {q && (
          <button className="btn-secondary" onClick={() => { setQ(""); load(); }}>Limpar</button>
        )}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem" }}>
          <p style={{ marginBottom: 8 }}><strong>Catálogo vazio.</strong></p>
          <p style={{ color: "#6b7280" }}>
            Vá em <a href="/admin/imports/products">Admin → Importar Produtos</a> e suba a planilha Excel.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {products.map((p) => (
            <div key={p.code} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", background: "#fff" }}>
              <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: "0.5rem" }}>🍾</div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 4 }}>{p.code}</p>
              <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", minHeight: 40 }}>{p.name}</h3>
              {p.bottleMl && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>🥃 {p.bottleMl} mL</p>}
              <div style={{ marginTop: "0.75rem" }}>
                <p><strong>R$ {Number(p.priceUnit).toFixed(2)}</strong> <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>/ garrafa</span></p>
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Caixa c/ {p.unitsPerBox}: R$ {Number(p.priceBox).toFixed(2)}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
                  onClick={() => handleAdd(p, "UNIT")}
                >
                  {added === `${p.code}-UNIT` ? "✅" : "+ Garrafa"}
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
                  onClick={() => handleAdd(p, "BOX")}
                >
                  {added === `${p.code}-BOX` ? "✅" : "+ Caixa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnLink: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  padding: "0.45rem 0.9rem",
  borderRadius: 8,
};
