import { Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";
import { PrismaService } from "../prisma/prisma.service";
import { NominatimService } from "../nominatim/nominatim.service";
import { normalizeCep, cepToInt, isValidCep } from "../../common/cep.util";
import { parseEmb, parsePrice } from "../../common/emb.util";

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nominatim: NominatimService,
  ) {}

  // ─── IMPORT PRODUTOS ───────────────────────────────────────────────────
  async importProductsXlsx(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const REQUIRED = ["CÓD", "PRODUTO/DENOMINAÇÃO / ORIGEM", "CAIXA S/IPI"];

    let sheetName: string | null = null;
    let rows: any[] = [];

    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (data.length) {
        const keys = Object.keys(data[0] as object);
        if (REQUIRED.every((r) => keys.some((k) => k.trim().toUpperCase().includes(r.split(" ")[0])))) {
          sheetName = name;
          rows = data as any[];
          break;
        }
      }
    }

    if (!sheetName) return { ok: false, error: "Nenhuma aba com as colunas esperadas encontrada" };

    let processed = 0;
    let upserted = 0;
    let skipped = 0;
    const errors: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawCode = String(row["CÓD"] ?? "").trim();
      if (!rawCode || !/^[A-Za-z0-9_\-]{1,32}$/.test(rawCode)) { skipped++; continue; }

      const name = String(row["PRODUTO/DENOMINAÇÃO / ORIGEM"] ?? "").trim();
      if (!name) { skipped++; continue; }

      const rawPrice = row["CAIXA S/IPI"];
      const priceBox = parsePrice(rawPrice);
      if (!priceBox || priceBox <= 0) {
        errors.push({ row: i + 2, code: rawCode, error: "Preço inválido" });
        continue;
      }

      const rawEmb = String(row["EMB"] ?? "").trim();
      const { unitsPerBox, bottleMl } = parseEmb(rawEmb);
      const priceUnit = parseFloat((priceBox / unitsPerBox).toFixed(2));

      try {
        await this.prisma.product.upsert({
          where: { code: rawCode },
          update: { name, priceBox, unitsPerBox, priceUnit, bottleMl, active: true },
          create: { code: rawCode, name, priceBox, unitsPerBox, priceUnit, bottleMl, active: true },
        });
        upserted++;
      } catch (e: any) {
        errors.push({ row: i + 2, code: rawCode, error: e.message });
      }
      processed++;
    }

    return { ok: true, sheetUsed: sheetName, processed, upserted, skipped, errors };
  }

  // ─── IMPORT DISTRIBUIDORES ─────────────────────────────────────────────
  async importDistributorsXlsx(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];

    let processed = 0;
    let upserted = 0;
    let geocoded = 0;
    const errors: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const code = String(row["distributor_code"] ?? "").trim();
      const name = String(row["distributor_name"] ?? "").trim();
      const rawCep = String(row["cep"] ?? "").trim();

      if (!code || !name || !rawCep) { errors.push({ row: i + 2, error: "code/name/cep obrigatórios" }); continue; }

      const cep = normalizeCep(rawCep);
      if (!isValidCep(cep)) { errors.push({ row: i + 2, code, error: "CEP inválido" }); continue; }

      let lat = row["lat"] ? parseFloat(row["lat"]) : null;
      let lng = row["lng"] ? parseFloat(row["lng"]) : null;

      if (!lat || !lng) {
        const geo = await this.nominatim.geocodeCep(cep);
        if (geo) { lat = geo.lat; lng = geo.lng; geocoded++; }
      }

      const apiKey = String(row["distributor_api_key"] ?? "").trim() || null;

      try {
        await this.prisma.distributor.upsert({
          where: { code },
          update: {
            name, cep, lat, lng,
            serviceRadiusKm: row["service_radius_km"] ? parseFloat(row["service_radius_km"]) : null,
            priority: row["priority"] ? parseInt(row["priority"], 10) : 100,
            active: String(row["active"] ?? "true").toLowerCase() !== "false",
            emitsNf: String(row["emits_nf"] ?? "true").toLowerCase() !== "false",
            ...(apiKey ? { apiKey } : {}),
          },
          create: {
            code, name, cep, lat, lng,
            serviceRadiusKm: row["service_radius_km"] ? parseFloat(row["service_radius_km"]) : null,
            priority: row["priority"] ? parseInt(row["priority"], 10) : 100,
            active: String(row["active"] ?? "true").toLowerCase() !== "false",
            emitsNf: String(row["emits_nf"] ?? "true").toLowerCase() !== "false",
            apiKey,
          },
        });
        upserted++;
      } catch (e: any) {
        errors.push({ row: i + 2, code, error: e.message });
      }
      processed++;
    }

    return { ok: true, processed, upserted, geocoded, errors };
  }

  // ─── IMPORT ZONAS DE FRETE ─────────────────────────────────────────────
  async importShippingZonesXlsx(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];

    let zonesProcessed = 0;
    let rangesInserted = 0;
    let rangesSoftDeleted = 0;
    const errors: any[] = [];

    // Agrupar por zone_code
    const zoneMap = new Map<string, any[]>();
    for (const row of rows) {
      const zoneCode = String(row["zone_code"] ?? "").trim().toUpperCase();
      if (!zoneCode) continue;
      if (!zoneMap.has(zoneCode)) zoneMap.set(zoneCode, []);
      zoneMap.get(zoneCode)!.push(row);
    }

    for (const [zoneCode, zoneRows] of zoneMap.entries()) {
      const first = zoneRows[0];
      const zoneName = String(first["zone_name"] ?? zoneCode).trim();
      const priceRaw = parsePrice(first["zone_price"]);
      if (!priceRaw) { errors.push({ zone: zoneCode, error: "zone_price inválido" }); continue; }

      // Upsert zona
      const zone = await this.prisma.shippingZone.upsert({
        where: { code: zoneCode },
        update: {
          name: zoneName,
          price: priceRaw,
          priority: first["zone_priority"] ? parseInt(first["zone_priority"], 10) : 100,
          active: String(first["zone_active"] ?? "true").toLowerCase() !== "false",
        },
        create: {
          code: zoneCode,
          name: zoneName,
          price: priceRaw,
          priority: first["zone_priority"] ? parseInt(first["zone_priority"], 10) : 100,
          active: String(first["zone_active"] ?? "true").toLowerCase() !== "false",
        },
      });

      // Soft-delete ranges existentes
      const deleted = await this.prisma.shippingZoneCepRange.updateMany({
        where: { zoneId: zone.id, deletedAt: null },
        data: { deletedAt: new Date(), active: false },
      });
      rangesSoftDeleted += deleted.count;

      // Inserir novos ranges
      for (let i = 0; i < zoneRows.length; i++) {
        const row = zoneRows[i];
        const rawStart = String(row["range_cep_start"] ?? "").trim();
        const rawEnd = String(row["range_cep_end"] ?? "").trim();
        const startNorm = normalizeCep(rawStart);
        const endNorm = normalizeCep(rawEnd);

        if (!isValidCep(startNorm) || !isValidCep(endNorm)) {
          errors.push({ zone: zoneCode, row: i, error: "CEP inválido" });
          continue;
        }

        const startInt = cepToInt(startNorm);
        const endInt = cepToInt(endNorm);
        if (startInt > endInt) {
          errors.push({ zone: zoneCode, row: i, error: "range_cep_start > range_cep_end" });
          continue;
        }

        await this.prisma.shippingZoneCepRange.create({
          data: {
            zoneId: zone.id,
            cepStart: startNorm,
            cepEnd: endNorm,
            cepStartInt: startInt,
            cepEndInt: endInt,
            spanInt: endInt - startInt,
            active: String(row["range_active"] ?? "true").toLowerCase() !== "false",
          },
        });
        rangesInserted++;
      }

      zonesProcessed++;
    }

    return { ok: true, zonesProcessed, rangesInserted, rangesSoftDeleted, errors };
  }
}
