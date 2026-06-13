#!/bin/bash
# Configure GitHub deploy key for private repo on VPS.
# Run once on server: bash scripts/setup-github-deploy-key.sh
set -euo pipefail

KEY="/root/.ssh/github_stroistroy"
REPO="git@github.com:vizuallarin-ai/voytkevich-artel.git"
APP_DIR="${APP_DIR:-/opt/stroistroy}"

if [ ! -f "$KEY" ]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "stroistroy-vps-deploy"
fi

mkdir -p /root/.ssh
chmod 700 /root/.ssh

if ! grep -q "Host github.com" /root/.ssh/config 2>/dev/null; then
  cat >> /root/.ssh/config << EOF

Host github.com
  HostName github.com
  User git
  IdentityFile $KEY
  IdentitiesOnly yes
EOF
  chmod 600 /root/.ssh/config
fi

echo ""
echo "=== Add this deploy key to GitHub (repo → Settings → Deploy keys) ==="
cat "${KEY}.pub"
echo "====================================================================="
echo ""
echo "After adding the key, run:"
echo "  cd $APP_DIR && git remote set-url origin $REPO && git pull origin master"
