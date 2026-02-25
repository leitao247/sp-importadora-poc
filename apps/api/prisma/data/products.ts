import { PrismaClient } from "@prisma/client";

export async function seedProducts(prisma: PrismaClient): Promise<number> {
  const products = [
    { code: "3000211", name: "Vinho Tinto Seco Cabernet Sauvignon – Reserva", priceBox: 450.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000212", name: "Vinho Tinto Merlot – Safra 2022", priceBox: 360.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000213", name: "Vinho Branco Chardonnay – Seleção", priceBox: 330.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000214", name: "Vinho Rosé Pinot Noir – Premium", priceBox: 390.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000215", name: "Espumante Brut – Cuvée Especial", priceBox: 480.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000216", name: "Vinho Tinto Syrah – Gran Reserva", priceBox: 540.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000217", name: "Vinho Tinto Malbec Argentino – Mendoza", priceBox: 420.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000218", name: "Vinho Branco Sauvignon Blanc – Vale do São Francisco", priceBox: 300.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "PORT_001", name: "Vinho do Porto – Ruby Reserve", priceBox: 600.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "PORT_002", name: "Vinho do Porto – Tawny 10 Anos", priceBox: 720.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "ESP_001", name: "Cava Brut Nature – D.O. Cava", priceBox: 390.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "ESP_002", name: "Prosecco DOC Extra Dry", priceBox: 420.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000220", name: "Vinho Tinto Tempranillo Rioja – Crianza", priceBox: 510.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000221", name: "Vinho Tinto Carmenère – Chile", priceBox: 360.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000222", name: "Vinho Branco Riesling – Alemanha", priceBox: 480.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000223", name: "Vinho Tinto Primitivo – Puglia", priceBox: 396.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000224", name: "Champagne Brut – Mousseux NV", priceBox: 900.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000225", name: "Vinho Tinto Tannat – Uruguai", priceBox: 432.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000226", name: "Vinho Branco Viognier – Rhône", priceBox: 528.0, unitsPerBox: 6, bottleMl: 750 },
    { code: "3000227", name: "Vinho Rosé Provence – Les Croix", priceBox: 456.0, unitsPerBox: 6, bottleMl: 750 },
  ];

  let count = 0;
  for (const p of products) {
    const priceUnit = parseFloat((p.priceBox / p.unitsPerBox).toFixed(2));
    await prisma.product.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        priceBox: p.priceBox,
        unitsPerBox: p.unitsPerBox,
        priceUnit,
        bottleMl: p.bottleMl,
        active: true,
      },
      create: {
        code: p.code,
        name: p.name,
        priceBox: p.priceBox,
        unitsPerBox: p.unitsPerBox,
        priceUnit,
        bottleMl: p.bottleMl,
        active: true,
      },
    });
    count++;
  }
  return count;
}
