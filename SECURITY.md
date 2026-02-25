# Política de Segurança — S&P Importadora

## Versões suportadas

| Versão | Suporte |
|--------|---------|
| `main` | ✅ Suportada |
| `develop` | ⚠️ Em desenvolvimento (pode ter bugs) |

## Reportando uma Vulnerabilidade

Por favor, **não** abra uma Issue pública para vulnerabilidades de segurança.

Use a função [Private Vulnerability Reporting](https://github.com/leitao247/sp-importadora-poc/security/advisories/new)
do GitHub para reportar de forma confidencial.

Inclua:
- Descrição do problema
- Passos para reproduzir
- Impacto estimado

Responderemos em até 72 horas.

## Segredos que NUNCA devem ser commitados

- `.env` / `.env.local` / `.env.*.local`
- `ADMIN_API_KEY`
- Chaves de API de distribuidores
- Tokens de pagamento (MercadoPago, etc.)
- Credenciais de banco de dados

Use sempre `.env.example` com valores placeholder.

## Ferramentas de proteção ativas

- GitHub Secret Scanning
- GitHub Push Protection
- `.gitignore` cobrindo todos os arquivos `.env*`
