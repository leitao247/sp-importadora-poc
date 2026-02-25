export default function AdminHomePage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ marginBottom: "1rem" }}>🛠 Admin — MVP</h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Aqui você importa dados via Excel e gerencia chaves de distribuidores.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        <a href="/admin/imports/shipping-zones" style={card}>
          <h3>📦 Importar Zonas de Frete</h3>
          <p>Faixas de CEP + preço (template único).</p>
        </a>
        <a href="/admin/imports/distributors" style={card}>
          <h3>🏭 Importar Distribuidores</h3>
          <p>CEP + (lat/lng opcional) com geocoding automático.</p>
        </a>
        <a href="/admin/imports/products" style={card}>
          <h3>🍷 Importar Produtos</h3>
          <p>Planilha de preços → catálogo do MVP.</p>
        </a>
        <a href="/admin/distributors" style={card}>
          <h3>🔑 Distribuidores</h3>
          <p>Listar e rotacionar API key para login no portal.</p>
        </a>
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Ordem recomendada</h3>
        <ol style={{ paddingLeft: "1.25rem", color: "#374151" }}>
          <li>Importar <strong>Zonas de Frete</strong></li>
          <li>Importar <strong>Distribuidores</strong></li>
          <li>Importar <strong>Produtos</strong></li>
          <li>Ir para <a href="/">Vitrine</a> → <a href="/checkout">Checkout</a> → <a href="/track">Tracking</a></li>
        </ol>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "inherit",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "1rem",
  background: "#fff",
};
