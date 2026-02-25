import { PrismaClient } from "@prisma/client";

function cepToInt(cep: string): number {
  return parseInt(cep.replace(/\D/g, "").padStart(8, "0"), 10);
}

export async function seedShippingZones(prisma: PrismaClient): Promise<number> {
  const zones = [
    {
      code: "ZONA_PR",
      name: "Paraná",
      price: 25.0,
      priority: 200,
      ranges: [
        { start: "80000000", end: "87999999" },
      ],
    },
    {
      code: "ZONA_SC",
      name: "Santa Catarina",
      price: 28.0,
      priority: 190,
      ranges: [
        { start: "88000000", end: "89999999" },
      ],
    },
    {
      code: "ZONA_RS",
      name: "Rio Grande do Sul",
      price: 30.0,
      priority: 185,
      ranges: [
        { start: "90000000", end: "99999999" },
      ],
    },
    {
      code: "ZONA_SP_CAP",
      name: "São Paulo Capital",
      price: 32.0,
      priority: 180,
      ranges: [
        { start: "01000000", end: "05999999" },
        { start: "08000000", end: "08499999" },
      ],
    },
    {
      code: "ZONA_SP_INT",
      name: "São Paulo Interior",
      price: 40.0,
      priority: 170,
      ranges: [
        { start: "06000000", end: "07999999" },
        { start: "08500000", end: "19999999" },
      ],
    },
    {
      code: "ZONA_RJ",
      name: "Rio de Janeiro",
      price: 35.0,
      priority: 175,
      ranges: [
        { start: "20000000", end: "28999999" },
      ],
    },
    {
      code: "ZONA_MG",
      name: "Minas Gerais",
      price: 38.0,
      priority: 165,
      ranges: [
        { start: "30000000", end: "39999999" },
      ],
    },
    {
      code: "ZONA_NORDESTE",
      name: "Nordeste",
      price: 55.0,
      priority: 120,
      ranges: [
        { start: "40000000", end: "65999999" },
      ],
    },
    {
      code: "ZONA_NORTE",
      name: "Norte",
      price: 65.0,
      priority: 110,
      ranges: [
        { start: "66000000", end: "69999999" },
      ],
    },
    {
      code: "ZONA_CO",
      name: "Centro-Oeste",
      price: 48.0,
      priority: 130,
      ranges: [
        { start: "70000000", end: "79999999" },
      ],
    },
  ];

  let count = 0;
  for (const z of zones) {
    const zone = await prisma.shippingZone.upsert({
      where: { code: z.code },
      update: { name: z.name, price: z.price, priority: z.priority, active: true },
      create: { code: z.code, name: z.name, price: z.price, priority: z.priority, active: true },
    });

    // Soft-delete ranges existentes
    await prisma.shippingZoneCepRange.updateMany({
      where: { zoneId: zone.id, deletedAt: null },
      data: { deletedAt: new Date(), active: false },
    });

    // Criar novos ranges
    for (const r of z.ranges) {
      const startInt = cepToInt(r.start);
      const endInt = cepToInt(r.end);
      await prisma.shippingZoneCepRange.create({
        data: {
          zoneId: zone.id,
          cepStart: r.start,
          cepEnd: r.end,
          cepStartInt: startInt,
          cepEndInt: endInt,
          spanInt: endInt - startInt,
          active: true,
        },
      });
    }
    count++;
  }
  return count;
}
