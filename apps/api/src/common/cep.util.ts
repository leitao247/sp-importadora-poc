/** Normaliza CEP: remove não-numéricos e garante 8 dígitos */
export function normalizeCep(raw: string): string {
  return raw.replace(/\D/g, "").padStart(8, "0");
}

/** Converte CEP normalizado para inteiro */
export function cepToInt(cep: string): number {
  return parseInt(normalizeCep(cep), 10);
}

/** Valida se CEP é válido (8 dígitos numéricos) */
export function isValidCep(raw: string): boolean {
  return /^\d{8}$/.test(normalizeCep(raw));
}
