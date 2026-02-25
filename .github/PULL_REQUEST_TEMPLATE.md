## Objetivo
<!-- Descreva em 1-2 frases o que essa PR faz -->

## Tipo de mudança
- [ ] feat — nova funcionalidade
- [ ] fix — correção de bug
- [ ] refactor — refatoração sem mudança de comportamento
- [ ] chore — configuração / dependências
- [ ] docs — documentação
- [ ] ci — pipeline / GitHub Actions

## O que mudou
<!-- Liste os arquivos/módulos alterados e o motivo -->

## Como testar
1. `docker compose up -d`
2. `pnpm install && pnpm db:migrate`
3. Passos específicos...

## Impacto em módulos
- [ ] Frete (zonas / CEP ranges)
- [ ] Roteamento (geocoding / Haversine)
- [ ] Checkout / Pedidos
- [ ] Portal do Distribuidor
- [ ] Admin / Imports
- [ ] CI / Infra

## Checklist
- [ ] CI verde (lint, typecheck, build)
- [ ] Sem secrets ou .env hardcodados
- [ ] Logs/debug removidos
- [ ] ADR criado/atualizado (se necessário)
- [ ] README atualizado (se necessário)
