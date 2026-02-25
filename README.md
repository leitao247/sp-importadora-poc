# 🍷 S&P Importadora — E-commerce B2C (Dropshipping)

MVP de e-commerce B2C para distribuição de vinhos via modelo dropshipping, com roteamento automático de pedidos para distribuidores regionais pelo CEP do cliente.

---

## 🎯 Visão do Projeto

A **S&P Importadora** é a fornecedora central. O cliente compra no site; o pedido é roteado automaticamente para o distribuidor mais próximo com estoque, que realiza a entrega. A S&P mantém controle de pricing, marca e dados do consumidor final.

**Diferenciais:**
- Dropshipping digital — sem estoque próprio de last-mile
- Roteamento inteligente por geolocalização (CEP → lat/lng → Haversine)
- Catálogo, distribuidores e frete gerenciados via importação Excel
- Checkout convidado (sem obrigatoriedade de cadastro)
- Portal do distribuidor com autenticação por API Key
- Tracking público de pedidos

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + TypeScript (SSR/SSG) |
| Backend | NestJS + TypeScript + Prisma ORM |
| Banco de dados | PostgreSQL 16 |
| Cache / Filas | Redis 7 (opcional no MVP) |
| Geocoding | OpenStreetMap Nominatim |
| Infra local | Docker Compose |
| Monorepo | pnpm + Turborepo |
| CI | GitHub Actions |

---

## 🚀 Rodando Localmente

### Pré-requisitos
- Node.js ≥ 20
- pnpm ≥ 9
- Docker + Docker Compose

### 1. Clone e instale

```bash
git clone git@github.com:leitao247/sp-importadora-poc.git
cd sp-importadora-poc
cp .env.example .env
pnpm install
```

### 2. Suba o banco e Redis

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 3. Migrações e seed

```bash
pnpm db:migrate    # aplica migrations Prisma
pnpm db:seed       # popula produtos, distribuidores, zonas e pedido de exemplo
```

### 4. Inicie os apps

```bash
pnpm dev
```

| App | URL |
|-----|-----|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |

---

## 📁 Estrutura do Repositório

```
sp-digital-commerce/
├─ apps/
│  ├─ api/          # NestJS REST API
│  │  ├─ prisma/    # Schema, migrations, seed
│  │  └─ src/       # Modules: health, catalog, shipping, routing, orders, imports...
│  └─ web/          # Next.js storefront + admin + portal distribuidor
│     └─ src/app/   # Pages: /, /checkout, /track, /admin/*, /distributor/*
├─ packages/
│  └─ shared/       # DTOs e schemas compartilhados
├─ infra/docker/    # docker-compose.yml
├─ data/
│  ├─ raw/          # Arquivos Excel originais (não versionado)
│  └─ samples/      # Templates de Excel para importação
├─ docs/
│  └─ architecture/ # ADRs
├─ scripts/         # setup-github.sh, setup-branches.sh
└─ .github/         # CI, templates, CODEOWNERS
```

---

## 📊 Importação via Excel

### Produtos (`tabela_precos.xlsx`)
Aba com colunas: `CÓD`, `PRODUTO/DENOMINAÇÃO / ORIGEM`, `CAIXA S/IPI`, `EMB` (opcional)

### Distribuidores (`distributors.xlsx`)
Colunas: `distributor_code*`, `distributor_name*`, `cep*`, `service_radius_km`, `priority`, `active`, `emits_nf`, `lat`, `lng`, `distributor_api_key`

### Zonas de Frete (`shipping_zones.xlsx`)
Colunas: `zone_code*`, `zone_name*`, `zone_price*`, `zone_priority`, `zone_active`, `range_cep_start*`, `range_cep_end*`, `range_active`, `notes`

> Política: **REPLACE por zona** (soft-delete nos ranges antigos + inserção dos novos). Sobreposição de CEPs permitida (prioridade maior vence → menor span → menor preço).

---

## 🔑 Credenciais de Teste (após seed)

| Recurso | Valor |
|---------|-------|
| Admin API Key | `dev-admin-key-sp-2025` |
| Header admin | `x-admin-key` |
| Distribuidor PR | code: `DISTR_PR_001`, key: `dev-distr-key-pr001` |
| Header distribuidor | `x-distributor-code` + `x-distributor-key` |

---

## 📡 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/catalog/products` | Listar produtos |
| GET | `/shipping/quote?cep=80010000` | Calcular frete |
| POST | `/routing/quote` | Rotear distribuidor |
| POST | `/orders` | Criar pedido (guest) |
| GET | `/orders/:id/public` | Tracking público |
| GET | `/distributor/orders` | Pedidos do distribuidor |
| PATCH | `/distributor/orders/:id/status` | Atualizar status |
| POST | `/admin/import/products` | Importar produtos |
| POST | `/admin/import/distributors` | Importar distribuidores |
| POST | `/admin/import/shipping-zones` | Importar zonas de frete |
| GET | `/admin/distributors` | Listar distribuidores |
| POST | `/admin/distributors/:code/rotate-key` | Rotacionar API key |

---

## 🗺 Roadmap

| Fase | Foco |
|------|------|
| 1 – Fundação | E-commerce funcional, importações, roteamento, checkout |
| 2 – Lançamento | Pagamentos (MercadoPago), SEO, notificações, onboarding distribuidores |
| 3 – Escala | Marketplace, CRM/email, analytics/BI |
| 4 – Consolidação | Clube de assinaturas, fidelidade, app mobile (Expo) |

---

## 📐 Padrões de Engenharia

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `chore`, etc.)
- **Branches**: Git Flow leve (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
- **CI**: lint + typecheck + build obrigatórios em PRs
- **Segredos**: nunca no repositório — usar `.env` local e GitHub Secrets

---

## 📜 Licença

Todos os direitos reservados © S&P Importadora
