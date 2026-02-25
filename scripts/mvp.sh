#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "────────────────────────────────────────────"
echo "🚀 S&P Importadora — MVP Quickstart"
echo "────────────────────────────────────────────"

# 1) .env
if [ ! -f .env ]; then
  echo "🧩 Criando .env a partir de .env.example"
  cp .env.example .env
else
  echo "✅ .env já existe"
fi

# 2) Docker (Postgres + Redis)
echo "🐳 Subindo Postgres/Redis (docker compose)"
docker compose -f infra/docker/docker-compose.yml up -d

echo "⏳ Aguardando Postgres ficar saudável..."
# espera simples
for i in {1..30}; do
  if docker ps --format '{{.Names}}' | grep -q '^sp_postgres$'; then
    if docker inspect --format='{{json .State.Health.Status}}' sp_postgres 2>/dev/null | grep -q healthy; then
      echo "✅ Postgres saudável"
      break
    fi
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "⚠️  Postgres ainda não está healthy. Vou continuar mesmo assim."
  fi
done

# 3) deps
if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm não encontrado. Instale com: npm i -g pnpm"
  exit 1
fi

echo "📦 Instalando dependências (pnpm)"
pnpm install

# 4) Prisma
export $(grep -v '^#' .env | xargs) >/dev/null 2>&1 || true

echo "🧱 Prisma generate + migrate"
pnpm --filter @sp/api prisma:generate
pnpm --filter @sp/api prisma:migrate

# 5) Seed
echo "🌱 Seed"
pnpm db:seed

echo "▶️  Iniciando WEB + API"
echo "   - Web:    http://localhost:3000"
echo "   - API:    http://localhost:3001"
echo "   - Swagger http://localhost:3001/docs"
echo ""
echo "🔑 Admin Key (dev): dev-admin-key-sp-2025"
echo "🔑 Distr PR (dev): code=DISTR_PR_001 key=dev-distr-key-pr001"
echo ""

echo "Dica: abra no navegador e siga o painel 'Comece por aqui' na Home."

echo ""
echo "(Ctrl+C para parar)"

pnpm dev
