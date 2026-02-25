#!/usr/bin/env bash
# Uso: bash scripts/setup-branches.sh leitao247/sp-importadora-poc
set -e

REPO=${1:-"leitao247/sp-importadora-poc"}
echo "🔒 Configurando proteção de branches para: $REPO"

# Proteger main
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint · Typecheck · Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null

echo "✅ Branch main protegida"

# Proteger develop
gh api repos/$REPO/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":false,"contexts":["Lint · Typecheck · Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null

echo "✅ Branch develop protegida"
