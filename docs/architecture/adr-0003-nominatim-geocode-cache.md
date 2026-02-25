# ADR-0003 — Geocoding via Nominatim com Cache

**Data:** 2026-02-24
**Status:** Aceito

## Contexto

Para calcular a distância entre o cliente (CEP) e os distribuidores (lat/lng), precisamos de um serviço de geocoding. Opções avaliadas:
- Google Maps Geocoding API (pago, alta precisão)
- Mapbox (pago, tier gratuito limitado)
- **OpenStreetMap Nominatim** (gratuito, política de uso justo)

## Decisão

**Nominatim** para o MVP, com as seguintes salvaguardas:

1. **Cache em PostgreSQL** (`GeoCache` model) — TTL indefinido para CEPs fixos
2. **Rate limiting**: mínimo 1.100ms entre requests (política Nominatim: 1 req/s)
3. **User-Agent** obrigatório com nome da aplicação e e-mail de contato
4. Geocoding em background durante importação de distribuidores

### Evolução

- Fase 2+: migrar para Google Maps ou Mapbox para maior precisão
- Adapter pattern: `GeocoderProvider` interface permite troca sem alterar módulos

## Consequências

✅ Zero custo no MVP  
✅ Cache reduz chamadas ao Nominatim para CEPs recorrentes  
⚠️ Precisão menor que Google Maps para endereços sem número  
⚠️ Importações em lote de distribuidores podem ser lentas (rate limit)
