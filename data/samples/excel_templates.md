# Template Excel — Zonas de Frete

## Nome do arquivo: `shipping_zones.xlsx`
## Nome da aba: `zones` (ou qualquer nome)

## Colunas obrigatórias (*)

| Coluna | Obrigatório | Tipo | Exemplo | Regra |
|--------|-------------|------|---------|-------|
| `zone_code` | ✅ | texto | `ZONA_PR` | `^[A-Z0-9_]{3,32}$` |
| `zone_name` | ✅ | texto | `Paraná` | — |
| `zone_price` | ✅ | decimal | `25.00` | ≥ 0 |
| `zone_priority` | ❌ | inteiro | `200` | padrão: 100 |
| `zone_active` | ❌ | booleano | `true` | padrão: true |
| `range_cep_start` | ✅ | texto/número | `80000000` | 8 dígitos |
| `range_cep_end` | ✅ | texto/número | `87999999` | 8 dígitos, start ≤ end |
| `range_active` | ❌ | booleano | `true` | padrão: true |
| `notes` | ❌ | texto | `Teste` | informativo |

## Exemplo de linhas

| zone_code | zone_name | zone_price | zone_priority | zone_active | range_cep_start | range_cep_end | range_active | notes |
|-----------|-----------|------------|---------------|-------------|-----------------|---------------|--------------|-------|
| ZONA_PR | Paraná | 25.00 | 200 | true | 80000000 | 87999999 | true | — |
| ZONA_SC | Santa Catarina | 28.00 | 190 | true | 88000000 | 89999999 | true | — |
| ZONA_RS | Rio Grande do Sul | 30.00 | 185 | true | 90000000 | 99999999 | true | — |
| ZONA_SP_CAP | São Paulo Capital | 32.00 | 180 | true | 01000000 | 05999999 | true | SP Cap |
| ZONA_SP_CAP | São Paulo Capital | 32.00 | 180 | true | 08000000 | 08499999 | true | SP Cap (2) |

## Regras de negócio

- **Uma zona pode ter múltiplos ranges** (uma linha por range, repetindo `zone_code`)
- **Política REPLACE**: ao importar, os ranges antigos da zona são **soft-deleted** e novos são inseridos
- **Sobreposição permitida**: se dois ranges cobrem o mesmo CEP, a zona com **maior prioridade** vence. Em caso de empate, a faixa **mais específica** (menor span) vence
- CEPs com caracteres não-numéricos são normalizados automaticamente (ex.: `80.010-000` → `80010000`)

## Template para distribuidores (`distributors.xlsx`)

| distributor_code | distributor_name | cep | service_radius_km | priority | active | emits_nf | lat | lng | distributor_api_key |
|-----------------|-----------------|-----|-------------------|----------|--------|----------|-----|-----|---------------------|
| DISTR_PR_001 | Curitiba Premium | 80010000 | 100 | 200 | true | true | -25.4284 | -49.2733 | dev-distr-key-pr001 |
| DISTR_SP_001 | SP Capital | 01310100 | 120 | 190 | true | true | | | |

> Se `lat` e `lng` estiverem vazios, o sistema geocodifica automaticamente via OpenStreetMap/Nominatim (respeitando o rate limit de 1 req/s).
