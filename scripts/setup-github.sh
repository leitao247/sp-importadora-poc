#!/usr/bin/env bash
# Uso: bash scripts/setup-github.sh leitao247/sp-importadora-poc
set -e

REPO=${1:-"leitao247/sp-importadora-poc"}
echo "🔧 Configurando GitHub para: $REPO"

# ── Labels ─────────────────────────────────────────────────────────────────
echo "🏷  Criando labels..."
declare -A LABELS=(
  ["area: api"]="0075ca"
  ["area: web"]="e4e669"
  ["area: infra"]="f9d0c4"
  ["area: docs"]="cfd3d7"
  ["type: feat"]="0052cc"
  ["type: fix"]="d93f0b"
  ["type: chore"]="e4e669"
  ["type: spike"]="bfd4f2"
  ["priority: high"]="b60205"
  ["priority: medium"]="fbca04"
  ["priority: low"]="0e8a16"
  ["status: in-progress"]="1d76db"
  ["status: blocked"]="e11d48"
  ["status: review"]="7057ff"
  ["bug"]="d93f0b"
  ["enhancement"]="a2eeef"
)

for label in "${!LABELS[@]}"; do
  color="${LABELS[$label]}"
  gh label create "$label" --color "$color" --repo "$REPO" --force 2>/dev/null || true
done

# ── Milestones ────────────────────────────────────────────────────────────
echo "🎯 Criando milestones..."
M1=$(gh api repos/$REPO/milestones -f title="Fase 1 — Fundação Digital" -f description="E-commerce funcional: importações, roteamento, checkout" --jq '.number')
M2=$(gh api repos/$REPO/milestones -f title="Fase 2 — Lançamento e Tração" -f description="Pagamentos, SEO, notificações, onboarding distribuidores" --jq '.number')
M3=$(gh api repos/$REPO/milestones -f title="Fase 3 — Escala e Otimização" -f description="Marketplace, CRM/email, analytics/BI" --jq '.number')
M4=$(gh api repos/$REPO/milestones -f title="Fase 4 — Consolidação e Inovação" -f description="Assinaturas, fidelidade, app mobile" --jq '.number')

echo "✅ Milestones: $M1 $M2 $M3 $M4"

echo "📋 Pronto! Visite: https://github.com/$REPO"
