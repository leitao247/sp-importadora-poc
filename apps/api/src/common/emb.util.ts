/**
 * Extrai unitsPerBox e bottleMl de strings como:
 * "6 / 750mL", "12/375ml", "6", "6 garrafas"
 */
export function parseEmb(raw: string | undefined | null): {
  unitsPerBox: number;
  bottleMl: number | null;
} {
  if (!raw) return { unitsPerBox: 1, bottleMl: null };

  const str = String(raw).trim();

  // Padrão: "6 / 750mL" ou "6/750ml"
  const fullMatch = str.match(/^(\d+)\s*[\/|x]\s*(\d+)\s*ml?/i);
  if (fullMatch) {
    return {
      unitsPerBox: parseInt(fullMatch[1], 10),
      bottleMl: parseInt(fullMatch[2], 10),
    };
  }

  // Apenas número
  const onlyNum = str.match(/^(\d+)/);
  if (onlyNum) {
    return {
      unitsPerBox: parseInt(onlyNum[1], 10),
      bottleMl: null,
    };
  }

  return { unitsPerBox: 1, bottleMl: null };
}

/** Normaliza preço de string BR ou US para number */
export function parsePrice(raw: string | number | undefined | null): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return parseFloat(raw.toFixed(2));
  const str = String(raw).trim().replace(/[^\d,\.]/g, "");
  // Formato BR: 1.234,56 → 1234.56
  if (/\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(str)) {
    return parseFloat(str.replace(/\./g, "").replace(",", "."));
  }
  // Formato US/simples: 1234.56 ou 1234,56
  return parseFloat(str.replace(",", ".")) || null;
}
