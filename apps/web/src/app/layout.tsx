import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S&P Importadora – Vinhos Premium",
  description:
    "Descubra nossa seleção de vinhos importados. Entrega direta pelo distribuidor mais próximo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header style={{ background: "#1a1a2e", color: "#fff", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold", fontSize: "1.25rem" }}>
            🍷 S&P Importadora
          </a>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/" style={{ color: "#ccc", textDecoration: "none" }}>Catálogo</a>
            <a href="/checkout" style={{ color: "#ccc", textDecoration: "none" }}>🛒 Carrinho</a>
            <a href="/track" style={{ color: "#ccc", textDecoration: "none" }}>Rastrear</a>
            <a href="/distributor/login" style={{ color: "#ccc", textDecoration: "none" }}>Portal</a>
          </nav>
        </header>
        <main style={{ minHeight: "80vh", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </main>
        <footer style={{ background: "#f5f5f5", textAlign: "center", padding: "1rem", color: "#666", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} S&P Importadora — Todos os direitos reservados
        </footer>
      </body>
    </html>
  );
}
