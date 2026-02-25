import { PrismaClient } from "@prisma/client";
import { seedProducts } from "./data/products";
import { seedDistributors } from "./data/distributors";
import { seedShippingZones } from "./data/shipping-zones";
import { seedOrder } from "./data/order";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // 1. Produtos
  const products = await seedProducts(prisma);
  console.log(`✅ ${products} produtos inseridos/atualizados`);

  // 2. Distribuidores
  const distributors = await seedDistributors(prisma);
  console.log(`✅ ${distributors} distribuidores inseridos/atualizados`);

  // 3. Zonas de frete
  const zones = await seedShippingZones(prisma);
  console.log(`✅ ${zones} zonas de frete inseridas/atualizadas`);

  // 4. Pedido de exemplo
  const order = await seedOrder(prisma);
  console.log(`✅ Pedido de exemplo criado: ${order}`);

  console.log("\n─────────────────────────────────────────");
  console.log("🔑 CREDENCIAIS DE TESTE");
  console.log("─────────────────────────────────────────");
  console.log("Admin API Key:        dev-admin-key-sp-2025");
  console.log("Distribuidor PR001:   dev-distr-key-pr001");
  console.log("Distribuidor SP001:   dev-distr-key-sp001");
  console.log("Distribuidor RJ001:   dev-distr-key-rj001");
  console.log("─────────────────────────────────────────");
  console.log("Swagger UI:           http://localhost:3001/docs");
  console.log("Web App:              http://localhost:3000");
  console.log(`Order ID exemplo:     ${order}`);
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
