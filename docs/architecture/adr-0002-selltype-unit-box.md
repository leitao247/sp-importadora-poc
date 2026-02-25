# ADR-0002 — Modelo de Venda por Unidade ou Caixa

**Data:** 2026-02-24
**Status:** Aceito

## Contexto

Vinhos são comercializados tanto por **garrafa individual** quanto por **caixa fechada** (geralmente 6 unidades). O sistema precisa suportar ambos os modelos e refletir os preços corretos.

## Decisão

- `Product.priceBox` — preço da caixa (importado da coluna `CAIXA S/IPI`)
- `Product.unitsPerBox` — unidades por caixa (extraído da coluna `EMB`, ex.: "6 / 750mL")
- `Product.priceUnit = priceBox / unitsPerBox` — calculado no import
- `OrderItem.sellType: "UNIT" | "BOX"` — escolha do cliente no carrinho

### Cálculo de preço

```
sellType === "UNIT" → unitPrice = product.priceUnit
sellType === "BOX"  → unitPrice = product.priceBox
lineTotal = unitPrice × quantity
```

## Consequências

✅ Flexibilidade para venda B2B (caixas) e B2C (garrafas)  
✅ Preço por garrafa derivado automaticamente do Excel  
⚠️ Necessário tratar `unitsPerBox = 0` (fallback para 1)
