# ADR-0001 — Frete por Faixa de CEP com Sobreposição Permitida

**Data:** 2026-02-24
**Status:** Aceito
**Decisores:** @leitao247

## Contexto

O sistema precisa calcular o frete baseado na localização do cliente (CEP). Duas abordagens foram consideradas:
- A) Frete por distância (km via Haversine)
- B) Frete por tabela de zonas/regiões baseadas em faixas de CEP

## Decisão

**Opção B — Zonas por Faixa de CEP**, com as seguintes regras:
- Cada `ShippingZone` tem N `ShippingZoneCepRange` (cepStart, cepEnd)
- Sobreposição de faixas é **permitida** (zona com maior prioridade vence)
- Em caso de empate de prioridade, a faixa **mais específica** (menor `spanInt`) vence
- Em caso de empate de span, o **menor preço** vence

### Política de importação: REPLACE por zona
- Ao importar o Excel, faixas existentes são **soft-deleted** (`deletedAt`, `active = false`)
- Novas faixas são inseridas
- A zona (preço, prioridade, nome) é **upserted**

## Consequências

✅ Gerenciamento simples via Excel  
✅ Permite zonas especiais (ex.: capital com preço diferente do interior)  
✅ Auditoria preservada pelo soft-delete  
⚠️ Requer índice em `(active, cepStartInt, cepEndInt)` para performance
