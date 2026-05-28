#!/usr/bin/env bash
# ─── Animipro — Hostinger deploy ────────────────────────────────────────────
#
# Builds the Next.js static export and uploads `out/` to a Hostinger Business
# / Cloud shared-hosting site via SSH (rsync).
#
# One-time setup:
#   1. Fill in the four HOSTINGER_* variables below (see comments for where
#      to find each in hPanel).
#   2. Make sure SSH is enabled on the hosting plan:
#      hPanel → Advanced → SSH Access → Enable
#   3. Add your local public key to the host:
#      ssh-copy-id -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST
#      (or paste it in hPanel → SSH Access → Manage SSH keys)
#
# Usage:
#   ./deploy-hostinger.sh          # build + upload
#   ./deploy-hostinger.sh --dry    # show what would change without uploading

set -euo pipefail

# ── Configuration ───────────────────────────────────────────────────────────
# Confirmed against `ssh -p 65002 u375308597@72.60.93.208`.
HOSTINGER_HOST="72.60.93.208"
HOSTINGER_USER="u375308597"
HOSTINGER_PORT="65002"
HOSTINGER_PATH="/home/${HOSTINGER_USER}/domains/animipro.online/public_html"

# ── Build ──────────────────────────────────────────────────────────────────
echo "▶ Building static export..."
rm -rf .next out
npm run build

if [ ! -d out ]; then
  echo "✖ out/ not produced by build. Check next.config.js has output: 'export'."
  exit 1
fi

# Belt-and-braces: make sure .htaccess made it into the build.
if [ ! -f out/.htaccess ]; then
  echo "▶ Copying .htaccess into out/ (Next sometimes skips dotfiles in public/)"
  cp public/.htaccess out/.htaccess
fi

# ── Upload ─────────────────────────────────────────────────────────────────
DRY=""
if [ "${1:-}" = "--dry" ]; then DRY="--dry-run"; echo "▶ DRY RUN — no files will change."; fi

echo "▶ Syncing out/ → ${HOSTINGER_USER}@${HOSTINGER_HOST}:${HOSTINGER_PATH}"
rsync $DRY -avz --delete \
  -e "ssh -p ${HOSTINGER_PORT}" \
  --exclude='.git' \
  --exclude='node_modules' \
  out/ \
  "${HOSTINGER_USER}@${HOSTINGER_HOST}:${HOSTINGER_PATH}/"

echo "✓ Done. Visit https://animipro.online"
